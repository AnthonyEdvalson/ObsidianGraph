from peewee import CharField

_table = None


def main(o):
    base = o.load(o.ins["base"])
    global _table

    if not _table:
        class Logs(base):
            message = CharField()

        _table = Logs
        _table.create_table()

    return _table
