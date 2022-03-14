# JSON Table

**JSON Table** is a simple format extension of [ndjson](http://ndjson.org)/[JSON Lines](https://jsonlines.org) that applies *CSV-mindset* to JSON tabular data.

It adds two requirements:

1. Each line is an array.
2. The first line specifies the column's names (and optional additional metadata).

Whereas a simple dataset might look like this in CSV:

```
id,firstName,lastName
1,Homer,Simpson
2,Marge,Simpson
3,Bart,Simpson
4,Lisa,Simpson
5,Maggie,Simpson
```

It would look like this in JSON Table:

```json
["id", "firstName", "lastName"]
[1, "Homer", "Simpson"]
[2, "Marge", "Simpson"]
[3, "Bart", "Simpson"]
[4, "Lisa", "Simpson"]
[5, "Maggie", "Simpson"]
```

While JSON Tables is a little more verbose, in exchange you receive a modern (default UTF-8 encoding) unambiguous format that easily supports data nesting.
