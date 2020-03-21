import os
import subprocess
import sys
import json
import atexit

from flask import Flask, request
from flask_cors import CORS

import pge
from postman import parse_request, make_response_success, make_response_fail


app = Flask("Engine")
subprocs = []


def close_npm():
    for subproc in subprocs:
        subproc.kill()


atexit.register(close_npm)


def graph_exec(node, req):
    g_data = json.load(open(os.path.join(sys.argv[1], "app.obgb")))
    args = {"req": req}
    return pge.run(g_data, args, node)


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


@app.route("/call", methods=["POST"])
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


@app.errorhandler(Exception)
def handle_uncaught(e):
    res = make_response_fail("obsidian", e)

    print("Uncaught exception!")
    print(request.get_data())
    print(res)

    return res, 500


def start(*argv):
    if len(argv) != 2:
        raise Exception("Must always provide one argument, the path of the graph to run")

    subprocs.append(subprocess.Popen("npm start", shell=True, cwd="pack/front"))

    CORS(app, origins=["http://localhost:3000", "http://localhost:3001"])
    app.run(debug=True)


if __name__ == '__main__':
    start(*sys.argv)
