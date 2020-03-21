def main(o):
    User = o.load(o.ins["t1"])
    req = o.consts["req"]
    un = User.select().where(User.id == req["user_id"])[0].username
    return un
