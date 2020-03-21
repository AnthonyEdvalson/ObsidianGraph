import json


def main(o):
    req = o.args["req"]
    path = req["path"] if "path" in req else "pack/graph.json"
    return json.load(open(path))
