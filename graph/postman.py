import json
import os
import traceback

import datetime
import peewee
import playhouse.shortcuts
from flask import request

import pge
import inspect


def parse_request():
    data = json.loads(request.get_data())
    if not isinstance(data, dict):
        raise Exception("The Obsidian Engine could not understand the message '{}'. ".format(request.get_data()) +
                        "It was expecting a valid JSON dictionary.")

    max_version = 1

    if "v" not in data or data["v"] > max_version:
        raise Exception("The {} package uses Obsidian protocol {}, ".format(data["package"], data["v"]) +
                        "but the Obsidian Engine it is running on only supports protocol {} and below.\n".format(
                            max_version) +
                        "Either downgrade the package, or update the engine to resolve the issue.")

    node = data["node"]
    args = data["args"]

    checks = [
        (node, "node", str),
        (args, "args", dict)
    ]

    for v, n, t in checks:
        if type(v) != t:
            msg = "Request has an invalid param type, {} should be a {} but is a {}"
            raise Exception(msg.format(n, t.__name__, type(v).__name__))

    return node, args


class JsonEncoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, datetime.datetime):
            return obj.isoformat()

        if issubclass(type(obj), peewee.Query):
            return [playhouse.shortcuts.model_to_dict(x) for x in obj]

        if issubclass(type(obj), peewee.Model):
            return playhouse.shortcuts.model_to_dict(obj)

        if inspect.isclass(obj):
            return None

        # TODO Clean up
        try:
            return super(JsonEncoder, self).default(obj)
        except:
            if hasattr(obj, "__dict__"):
                d = dict({k: v for k, v in obj.__dict__.items() if not k[0] == "_"})
                return super(JsonEncoder, self).default(d)
            else:
                return None


def make_response_success(data):
    res_data = {
        "status": "success",
        "errorType": None,
        "data": data
    }

    res = json.dumps(res_data, cls=JsonEncoder, indent=2)
    res_msg = json.dumps(data, cls=JsonEncoder, indent=2)
    lines = res_msg.split("\n")
    if len(lines) <= 5:
        res_msg = "\n".join(lines[:5]) + "\n..."

    return res, res_msg


def make_response_fail(error_type, e):
    e_tb = e
    if hasattr(e, "original_exception"):
        e_tb = e.original_exception

    cwd = os.path.realpath(os.getcwd())

    tb = []
    """if type(e) == pge.GraphException:
        for frame in e.trace:
            tb.append({
                "file": frame.file,
                "line": frame.line,
                "lineno": frame.lineno,
                "frame": "{}( {} )".format(frame.node_name, frame.args),
                "important": frame.file.startswith(cwd)
            })
    else:"""
    for frame in traceback.extract_tb(e_tb.__traceback__):
        path = os.path.realpath(frame.filename)

        tb.append({
            "file": path,
            "line": frame.line,
            "lineno": frame.lineno,
            "frame": frame.name if frame.name != "_node_preamble_identifier" else frame.node_name,
            "important": path.startswith(cwd)
        })

    data = {
        "msg": str(e),
        "tb": list(tb),  # TODO why does the tb reverse direction randomly???
        "type": type(e).__name__
    }

    res_data = {
        "status": "error",
        "errorType": error_type,
        "data": data
    }

    res = json.dumps(res_data, cls=JsonEncoder, indent=2)
    return res
