import os
import subprocess
import sys
import json
import atexit
from zipfile import ZipFile

import shutil
from flask import Flask, request
from flask_cors import CORS

import pge
from postman import parse_request, make_response_success, make_response_fail


flaskApp = Flask("Engine")
subprocs = []
obn = None


def close_npm():
    for p in subprocs:
        p.kill()


atexit.register(close_npm)


def graph_exec(node, req):
    args = {"req": req}
    return pge.run(obn.back, args, node)


def obsidian_exec(node, req):
    if node == "get graph":
        return json.load(open("pack/app.obgf"))

    if node == "open source":
        p = sys.platform
        file = req["file"]
        lineno = req["lineno"]

        if p == "darwin":
            app = "/Applications/PyCharm.app/Contents/MacOS/pycharm"
        elif p == "win32":
            app = "C:\\Program Files (x86)\\JetBrains\\PyCharm 2016.2.3\\bin\\pycharm.exe"
        else:
            raise Exception("'@open source' is not supported on {}".format(p))

        try:
            subprocess.Popen([app, "--line", str(lineno), file])
            # subprocess.Popen(["open", "-a", app])
        except Exception as e:
            raise Exception("Failed to open {}:{} due to the following error:\n{}".format(file, lineno, e))
        return None

    raise Exception("Unknown obsidian command '@{}'".format(node))


@flaskApp.route("/call", methods=["POST"])
def call():
    node, args = parse_request()

    try:
        if node.startswith("@"):
            data = obsidian_exec(node[1:], args)
        else:
            data = graph_exec(node, args)
        res, res_msg = make_response_success(data)
    except Exception as e:
        res = make_response_fail("processing", e)
        res_msg = res

    print("{} {} >>> {}".format(node, args, res_msg))
    return res


@flaskApp.errorhandler(Exception)
def handle_uncaught(e):
    res = make_response_fail("obsidian", e)

    print("Uncaught exception!")
    print(request.get_data())
    print(res)

    return res, 500


def load_obn(path):
    with ZipFile(path, "r") as obn:
        app = {
            "meta": json.load(obn.open("meta.json")),
            "front": json.load(obn.open("front.json")),
            "back": json.load(obn.open("back.json"))
        }

    folder = "pack/front/src/app/"
    if os.path.isdir(folder):
        for file in os.listdir(folder):
            file_path = folder + file
            if os.path.isfile(file_path):
                os.unlink(file_path)
            elif os.path.isdir(file_path):
                shutil.rmtree(file_path)
    else:
        os.mkdir(folder)

    with open(folder + "_front.json", "w+") as frontDataFile:
        json.dump(app["front"], frontDataFile)

    for key, node in app["front"]["nodes"].items():
        ext = ".jsx" if node["type"] == "code" else ".json"
        with open(folder + key + ext, "w+") as nodeFile:
            nodeFile.write(node["file"])

    return app


def start(*argv):
    global obn
    if len(argv) != 2:
        raise Exception("Must always provide one argument, the path of the graph to run")

    obn = load_obn(argv[1])

    subprocs.append(subprocess.Popen("npm start", shell=True, cwd="pack/front"))

    CORS(flaskApp, origins=["http://localhost:3000", "http://localhost:3001"])
    flaskApp.run(debug=True)


if __name__ == '__main__':
    start(*sys.argv)
