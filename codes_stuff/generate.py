from random import randint, choice

from string import ascii_lowercase, digits

s = list(ascii_lowercase + digits)
print(s)
with open('plain2', 'w') as f:
    for i in range(50):
        a = choice(s) + choice(s) + choice(s) + choice(s)
        b = choice(s) + choice(s) + choice(s) + choice(s)
        c = choice(s) + choice(s) + choice(s) + choice(s)
        d = choice(s) + choice(s) + choice(s) + choice(s)
        f.write("{}{}{}{}\n".format(a,b,c,d))
    