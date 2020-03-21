import importlib


def run(data, args, head_node):
    nodes = data["nodes"]

    def load(node_name):
        node = nodes[node_name]

        module = importlib.import_module("pack.back." + node["code"])
        if not hasattr(module, "main") or not callable(module.main):
            raise Exception("Cannot run node, main function does not exist or is not callable")

        class OObject:
            def __init__(self):
                self.ins = node["inputs"]
                self.consts = args
                self.load = load

        name = "CALL_" + node_name.replace(" ", "_")  # Displays node name in traceback, temporary hack
        exec("def {}(module, o):\n\treturn module.main(o)".format(name)) in locals()
        return locals()[name](module, OObject())

    return load(head_node)

"""
class GFrame:
    def __init__(self, node_name, args, stack_pos=None, stack=None):
        if stack_pos:
            stack = traceback.extract_stack(None, stack_pos+2)[0]

        self.node_name = node_name
        self.name = stack.name
        self.line = stack.line
        self.lineno = stack.lineno
        self.file = os.path.realpath(stack.filename)
        self.args = str(args)


class GraphException(Exception):
    def __init__(self, original, trace, node_name, args):
        if type(original) == GraphException:
            self.original_exception = original.original_exception
            self.trace = original.trace
        else:
            self.original_exception = original
            self.trace = trace

            x = traceback.extract_tb(original.__traceback__, -1)[0]

            self.trace.append(GFrame(node_name, args, stack=x))

        def __str__(self):
            return str(self.original_exception)
"""

"""
TRACEBACK

type: "TypeError"
message: "cannot find key..."
graphTrace: [
	{
		name: "step0"
		type: "py"
		file: "..."
		lineno: 4
		line: "    return o.ins[0].load()"
		result: None
	},
	{
		name: "step1"
		type: "js"
		file: "..."
		lineno: 24
		line: "        let x = o.loadRemote(1);"
		result: {...}
	},
	...
]
"""