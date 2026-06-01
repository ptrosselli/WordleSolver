import re

pattern = re.compile(r'^([A-Za-z-]+)\s+(.*)$')

with open("Oxford English Dictionary.txt", "r", encoding="utf-8") as file:
    for line in file:
        line = line.strip()

        if not line:
            continue

        match = pattern.match(line)

        if not match:
            continue

        word = match.group(1)
        definition = match.group(2)

        if len(word) == 5 and '-' not in word:
            print(f"{word}")