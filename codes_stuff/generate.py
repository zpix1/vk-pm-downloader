from random import randint

with open('plain2', 'w') as f:
    for i in range(1000):
        a = randint(1000, 9999)
        b = randint(1000, 9999)
        c = randint(1000, 9999)
        d = randint(1000, 9999)
        f.write("{}{}{}{}\n".format(a,b,c,d))
    