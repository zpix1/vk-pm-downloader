from hashlib import sha512
import json
from random import shuffle

ans = set()
with open('plain_n_encrypted', 'w') as pne:
    for c in open('plain2').read().split('\n'):
        sh = sha512(c.encode()).hexdigest()
        pne.write('{} {}\n'.format(c, sh))
        if sh in ans:
            print("AAAAAAAAA")
        ans.add('{}'.format(sh))

ans = list(ans)
shuffle(ans)
with open('encrypted.js', 'w') as e:
    e.write('export default {}'.format(json.dumps(list(ans))))