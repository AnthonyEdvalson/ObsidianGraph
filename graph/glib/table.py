from peewee import *


_table = None


def make_table(base, data):
    class OTable(base):
        pass

    OTable.__name__ = data["name"]

    for k, v in data["fields"].items():
        field = {
            "text": TextField,
            "datetime": DateTimeField,
            "float": FloatField,
            "bool": BooleanField,
            "int": IntegerField,
            "timestamp": TimestampField,
        }[v["type"]]()

        setattr(OTable, k, field)

    OTable.create_table()
    return OTable


def main(o):
    global _table

    if not _table:
        base = o.load(o.ins["db"])
        data = o.load(o.ins["format"])
        _table = make_table(base, data)

    return _table
