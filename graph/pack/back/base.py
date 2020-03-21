from peewee import SqliteDatabase, Model


db = SqliteDatabase("demo.db")


class BaseModel(Model):
    class Meta:
        database = db


def main(o):
    return BaseModel
