var gameJson =
{
  "game": {
    "title": "The Ghostly Case of the Spirit Theater",
    "icon": "<img src=\"ghost_theater.png\" width=\"150px\">",
    "start": "narrator/intro3",
    "clearHistory": "true",
  },
  "menu": {
    "Backpack": "showBackpack",
    "Map": "showMap",
    "Characters": "showCharacters",
    "Help!": "showHelp",
  },
  "functions": [
    {
      "name": "test",
      "code": "var a=1",
    },
  ],
  "rooms": [
    {
      "name": "atrium",
      "description": "a dark and echo-ey atrium",
      "comment": "I feel saddened by it's distant splendour.",
      "coords": "5,1-5,1",
      "color": "#0a0"
    },
    {
      "name": "hall",
      "description": "a dark and dusty hallway",
      "comment": "Is that blood on the floor?",
      "coords": "5,2-5,3",
      "color": "red"
    },
    {
      "name": "basement",
      "description": "a damp-smelling basement",
      "coords": "1,1-3,1:1,2-4,2",
      "color": "blue"

    },
    {
      "name": "stage",
      "description": "a dark stage",
      "coords": "3,6-7,6",
      "color": "green"

    },
    {
      "name": "auditorium",
      "description": "a cobweb-filled auditorium",
      "coords": "3,4-7,5",
      "color": "brown"

    },
    {
      "name": "balcony",
      "description": "a lofty balcony",
      "comment": "From here I can see the whole theater",
      "coords": "3,3-4,3:5,3-7,3",
      "color": "yellow"
    },
    {
      "name": "backstage",
      "description": "a backstage",
      "comment": "The floor is cluttered with fallen curtains and broken scenery from long-dead shows",
      "coords": "2,6-2,6:2,7-8,7:8,6-8,6",
      "color": "yellow"
    },
    {
      "name": "green-room",
      "description": "a green room",
      "comment": "Costumes and spilled makeup are strewn everywhere.",
      "coords": "8,4-8,5",
      "color": "#808"
    },
    {
      "name": "star-room",
      "description": "a star's changing room",
      "comment": "Pieces of a broken chair lie about. A cracked mirror hangs on the wall.",
      "coords": "9,6-9,6",
      "color": "#880"
    }
  ],
  "doors": [
    {
      "between": "atrium/hall",
      "type": "stairs/up",
    },
    {
      "between": "hall/basement",
      "opensWith": "hallBasementKey",
    },
    {
      "between": "hall/auditorium",
      "opensWith": "text/knock knock",
      "comment": " ...letters are carved into it... \"Tell me a joke...\""
    },
    {
      "between": "auditorium/stage",
      "type": "stairs/down",
    },
    {
      "between": "stage/backstage",
    },
    {
      "between": "backstage/star-room",
      "opensWith": "star-roomKey",
    },
    {
      "between": "backstage/green-room",
      "opensWith": "greenroomKey"
    },
  ],
  "objects": [
    {
      "name": "hallBasementKey",
      "description": "big brass key",
      "location": "atrium",
      "weight": "1",
      "properties": [
        {
          "name": "visible",
          "value": "false"
        }
      ],
      "propertyListener": "code/if(isProp('flashlight','on')) { this.properties.visible = value}",
      "actions": [
        {
          "name": "useOnDoors",
          "desc": "try it on the doors",
        }
      ]
    },
    {
      "name": "flashlight",
      "description": "old flashlight",
      "location": "atrium",
      "weight": "1",
      "properties": [
        {
          "name": "on",
          "value": "false"
        }
      ],
      "actions": [
        {
          "name": "turn on",
          "desc": "turn on the flashlight",
          "results": [
            "text/A weak shaft of light pierces the gloom"
          ],
          "when": "code/this.properties.on == false",
          "property": "on/true",
        },
        {
          "name": "turn off",
          "desc": "turn off the flashlight",
          "results": [
            "text/The gloom returns"
          ],
          "when": "code/this.properties.on == true",
          "property": "on/false",
        },
      ]
    },
    {
      "name": "cat",
      "description": "a sleek cat who eyes me from a distance, twitching it's tail",
      "location": "hall",
      "actions": [
        {
          "name": "crouch",
          "desc": "crouch down and give it my best 'here kitty kitty'",
          "results": ["text/The cat casts a disdainful look in your direction and turns away"],
        }, {
          "name": "ignore",
          "desc": "ignore it with admirable self-control",
          "results": ["character/stagemanager/hello"],
        }
      ],
      "weight": "0",
    }
  ],
  "characters": [
    {
      "name": "narrator",
      "location": "atrium",
      "scripts": [
        {
          "name": "intro",
          "text": "Are you ready to rumble...?",
          "actions": [
            {
              "name": "yup",
              "desc": "Well, duh, of course.",
              "results": ["character/narrator/introA"],
            }
          ]
        },
        {
          "name": "introA",
          "text": "You are a \"spectral investigator\" - a self-employed detective specializing in the paranormal. It is a normal day for you - ignore the alarm clock for an hour, drink a pot of coffee, check your empty day planner.\nThen just as you are about to settle in to scanning TikTok (for possible work leads of course) the phone rings...{audio:ring.mp3}and rings...{audio:ring.mp3}",
          "actions": [
            {
              "name": "ignore",
              "desc": "Nope, too early. Haven't read the paper yet or done (last) Friday's sudoko. Anyway, it's probably a solicitor.",
              "results": ["character/narrator/intro2"],
            },
            {
              "name": "pickup",
              "desc": "You pick it up. \"Morning\" you say (even though it's 12:30). \"Buster Ghost's detective agency, how can I help you?\"",
              "results": ["character/narrator/intro3"],
            }
          ]
        },
        {
          "name": "intro2",
          "text": "After 10 rings the phone stops. You pick up yesterday's sudoku. You haven't even got one more number before the phone rings again....",
          "actions": [
            {
              "name": "pickup",
              "desc": "You let it ring 9 times then pick it up. \"Morning\" you grumble (even though it's 12:30). \"Buster Ghost's detective agency.\"",
              "results": ["character/narrator/intro3"],
            }
          ]
        },
        {
          "name": "intro3",
          "text": "...on the other end of the line is an agitated male, age approximately 50, guessing from his way of speaking as having a somewhat theatrical flare.\nHe fills you in on his situation. He is the owner of a small theater which has fallen on hard times, mainly due to the fact that most of his cast were non-professional enough to get themselves killed by a spate of fatal accidents around the theater. The ones that survived decided to go and find a less-dangerous field of work.\nHe has decided to sell the theater but whenever potential buyers come to look at the place they are all scared away by what they claim are ghostly appartions. He would like you to come and basically get rid of them so he can {italic}\"sell the damn place\".{}",
          "actions": [
            {
              "name": "ok",
              "desc": "This sounds interesting... plus I'm broke, so I'll take the case.",
              "results": [
                "text/He gives me an address and I hop in a cab and find myself infront of a majestic, but worn-down, theater",
                "room/atrium"],
            },
            {
              "name": "nope",
              "desc": "Ooh, too scary. I think I'll just get back to watching cat videos",
              "results": ["exit"],
            }
          ]
        },
      ]
    },
    {
      "name": "stagemanager",
      "backstory": "My name is Kat. I was the stage manager for this theater",
      "scripts": [
        {
          "name": "hello",
          "text": "Hmmmrrrrr. Hmmmmeowww!<br><br>The cat nuzzles my leg.....<br><br>\"Helloooo. Who are you?\" - I hear those words in my head, but I swear the cat did not say them. I kneel down and look into it's green and somehow thoughtful eyes.",
          "actions": [
            {
              "name": "ignore",
              "desc": "No, you shake your head... you must be imagining it.",
              "results": ["text/The cat gives you a puzzled look and turns away"],
            },
            {
              "name": "thoughts",
              "desc": "You crouch down and say softly \"What's up little fella\"",
              "results": ["character/stagemanager/part1"],
            }
          ]
        },
        {
          "name": "part1",
          "text": "Hmmmrrrrr. Hmmmmeowww!<br><br>The cat looks me in the eye.....<br><br>I seem to hear, somewhere in my head... \"I need to tell you something... important\"...",
          "actions": [
            {
              "name": "thoughts",
              "desc": "You take a deep breath. \"OK, let's hear it\" you say, as if in a dream.",
              "results": ["character/stagemanager/part2"],
            },
            {
              "name": "ignore",
              "desc": "No, grrr... you REALLY must be imagining it.",
              "results": ["text/The cat gives you a puzzled look and turns away"],
            },
          ]
        },
        {
          "name": "part2",
          "text": "My name is Kat - I used to be the stage manager here, many years ago.",
          "actions": [
          ]
        }
      ]
    }
  ]
}
