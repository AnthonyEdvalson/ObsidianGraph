code = None


def main(o):
    global code

    if not code:
        code = compile(o.load(o.ins["command"]))

    return eval(code)
