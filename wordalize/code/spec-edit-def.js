var specEditDef =
{
  "game": {
    "title": "STRING",
    "icon": "STRING",
    "start": "[characters]/[scripts]",
    "clearHistory": "BOOLEAN",
    "wordDelayMS": "INT",
  },
  "characters": [
    {
      "name": "STRING",
      "backstory": "TEXT",
      "location": "[rooms]",
      "scripts": [
        {
          "name": "STRING",
          "text": "TEXT",
          "actions": [
            {
              "name": "STRING",
              "desc": "TEXT",
              "results": [
                "['text'|'character'|'object'|'function'|'code']/[TEXT|characters|objects|functions|TEXT]/[null|scripts|actions|null|null]"
              ],
              "when": "FUNCTION",
            },
          ]
        },
      ],
    },
  ],
  "objects": [
    {
      "name": "STRING",
      "description": "TEXT",
      "location": "[rooms]",
      "propertyListener": "FUNCTION",
      "properties": [
        {
          "name": "STRING",
          "value": "STRING",
        }
      ],
      "actions": [
        {
          "name": "STRING",
          "desc": "TEXT",
          "results": [
            "['text'|'character'|'object'|'function'|'code']/[TEXT|characters|objects|functions|TEXT]/[null|scripts|actions|null|null]"
          ],
          "when": "FUNCTION",
          "property": "STRING",
        }
      ]
    },
  ],
  "rooms": [
    {
      "name": "STRING",
      "description": "TEXT",
      "comment": "TEXT",
      "coords": "STRING",
      "images": "STRING",
      "color": "STRING"
    },
  ],
  "doors": [
    {
      "between": "[rooms]/[rooms]",
      "comment": "TEXT",
      "type": "['door'|'stairs']/[null|['up'|'down']]",
      "opensWith": "['open'|'text'|'object']/[null|STRING|objects]",
    },
  ],
  "functions": [
    {
      "name": "STRING",
      "code": "TEXT",
    },
  ],
}
