# Hero Customization Guide

This guide shows you exactly where and how to customize all hero details, images, stats, and abilities.

## 📍 Location

All hero data is located in **`Rivals.js`** starting around **line 576**.

The heroes are organized into three arrays:
- `vanguardHeroes` (starts around line 576)
- `duelistHeroes` (starts around line 728)
- `strategistHeroes` (starts around line 1031)

## 🎯 How to Edit Hero Data

### Step 1: Find the Hero

Open `Rivals.js` and search for the hero's name or ID. For example:
- Search for `'angela'` to find Angela
- Search for `'black-panther'` to find Black Panther
- Search for `'doctor-strange'` to find Doctor Strange

### Step 2: Edit Hero Properties

Each hero is an object with the following properties you can customize:

```javascript
{
  id: 'hero-id',                    // Unique identifier (don't change unless needed)
  category: 'vanguard',              // 'vanguard', 'duelist', or 'strategist'
  name: 'Hero Name',                 // ⭐ DISPLAY NAME - Change this!
  tagline: 'Hero Tagline',           // ⭐ SUBTITLE - Change this!
  summary: 'Hero description...',   // ⭐ SHORT DESCRIPTION - Change this!
  lore: 'Long backstory...',         // ⭐ FULL LORE - Change this!
  portrait: 'Images/PAngela.jpg',    // ⭐ PORTRAIT IMAGE PATH - Change this! (used in featured view)
  card: 'Images/PAngela.jpg',        // ⭐ CARD IMAGE PATH - Change this! (used in hero roster cards, can be different from portrait)
  background: 'Images/New1.jpg',     // ⭐ BACKGROUND IMAGE PATH - Change this!
  accent: '#ff9cd6',                 // ⭐ ACCENT COLOR (hex code) - Change this!
  realName: 'Real Name',             // ⭐ REAL NAME - Change this!
  attackType: 'Melee Heroes',        // ⭐ ATTACK TYPE - Change this!
  health: '275',                     // ⭐ HEALTH VALUE - Change this!
  difficulty: '★★★☆☆',              // ⭐ DIFFICULTY STARS - Change this!
  stats: [                           // ⭐ STATS ARRAY - Change these!
    { label: 'Difficulty', value: '★★★☆☆' },
    { label: 'Durability', value: 'High' },
    { label: 'Mobility', value: 'Leaping' },
    { label: 'Utility', value: 'Barrier Field' }
  ],
  abilities: [                       // ⭐ SKILLS ARRAY - Change these!
    { 
      name: 'Skill Name',            // Skill name
      description: 'Skill description...'  // Skill details
    }
  ]
}
```

## 📝 Detailed Editing Instructions

### 1. Change Hero Name
```javascript
name: 'Your Hero Name',
```

### 2. Change Tagline (Subtitle)
```javascript
tagline: 'Your Custom Tagline',
```

### 3. Change Summary (Short Description)
```javascript
summary: 'Your custom description that appears on the hero card.',
```

### 4. Change Lore (Full Backstory)
```javascript
lore: 'Your full backstory text that appears in the detailed view.',
```

### 5. Change Portrait Image
```javascript
portrait: 'Images/YourImage.jpg',
```
**Note:** Put your image file in the `Images/` folder and reference it here. This is used in the featured hero view.

### 6. Change Card Image (Hero Roster Card)
```javascript
card: 'Images/YourCardImage.jpg',
```
**Note:** Use `card:` to specify the image shown in the hero roster grid cards. It can be different from the portrait image. If not specified, it will use the portrait image.

### 7. Change Background Image
```javascript
background: 'Images/YourBackground.jpg',
```
**Note:** Put your background image in the `Images/` folder and reference it here.

### 8. Change Accent Color
```javascript
accent: '#ff9cd6',  // Use hex color codes like #ff0000 for red
```

### 9. Change Real Name
```javascript
realName: 'Your Character Real Name',
```

### 10. Change Attack Type
```javascript
attackType: 'Melee Heroes',  // Or 'Projectile Heroes', 'Hybrid Striker', etc.
```

### 11. Change Health Value
```javascript
health: '275',  // Use a string with the number
```

### 12. Change Difficulty Stars
```javascript
difficulty: '★★★☆☆',  // Use ★ for filled, ☆ for empty (1-5 stars)
```
Examples:
- `'★☆☆☆☆'` = 1 star
- `'★★☆☆☆'` = 2 stars
- `'★★★☆☆'` = 3 stars
- `'★★★★☆'` = 4 stars
- `'★★★★★'` = 5 stars

### 13. Change Stats
```javascript
stats: [
  { label: 'Difficulty', value: '★★★☆☆' },
  { label: 'Durability', value: 'High' },
  { label: 'Mobility', value: 'Leaping' },
  { label: 'Utility', value: 'Barrier Field' }
],
```
You can:
- Change the `value` of existing stats
- Add new stats by adding more objects
- Remove stats by deleting objects

### 14. Change Skills/Abilities
```javascript
abilities: [
  { 
    name: 'Hevenward Lunge', 
    description: 'Throw the spear forward, then warp to it, staggering the first target struck.' 
  },
  { 
    name: 'Celestial Bulwark', 
    description: 'Create a rotating shield halo that blocks projectiles for nearby allies.' 
  },
  { 
    name: 'Choir of Spears', 
    description: 'Summon a barrage of radiant blades that pin enemies in a circle and grant allies lifesteal.' 
  }
],
```
You can:
- Change skill names
- Change skill descriptions
- Add more skills (add more objects)
- Remove skills (delete objects)

## 🎨 Example: Complete Hero Edit

Here's a complete example of editing Angela:

```javascript
{
  id: 'angela',
  category: 'vanguard',
  name: 'Angela the Warrior',                    // ✅ Changed name
  tagline: 'Celestial Guardian',                 // ✅ Changed tagline
  summary: 'A powerful warrior who protects her allies with divine power.',  // ✅ Changed summary
  lore: 'Angela was born in the celestial realm and now fights to protect the Nexus.',  // ✅ Changed lore
  portrait: 'Images/MyAngela.jpg',               // ✅ Changed portrait image (featured view)
  card: 'Images/MyAngelaCard.jpg',               // ✅ Changed card image (roster grid)
  background: 'Images/MyBackground.jpg',         // ✅ Changed background image
  accent: '#ff0000',                             // ✅ Changed to red
  realName: 'Angela Odinsdottir',                // ✅ Changed real name
  attackType: 'Melee Heroes',
  health: '300',                                 // ✅ Changed health
  stats: [
    { label: 'Difficulty', value: '★★★★☆' },    // ✅ Changed to 4 stars
    { label: 'Durability', value: 'Very High' }, // ✅ Changed value
    { label: 'Mobility', value: 'High' },         // ✅ Changed value
    { label: 'Utility', value: 'Shield Master' } // ✅ Changed value
  ],
  abilities: [
    { 
      name: 'Divine Strike',                      // ✅ Changed skill name
      description: 'A powerful strike that deals massive damage.'  // ✅ Changed description
    },
    { 
      name: 'Protective Aura',                    // ✅ Changed skill name
      description: 'Creates a protective barrier around nearby allies.'  // ✅ Changed description
    },
    { 
      name: 'Heavenly Assault',                   // ✅ Changed skill name
      description: 'Summons divine energy to strike all enemies in range.'  // ✅ Changed description
    }
  ]
}
```

## 📂 Image File Locations

- **Portrait images:** Put in `Images/` folder
- **Background images:** Put in `Images/` folder
- **Reference them:** Use `'Images/YourFileName.jpg'` in the code

## ⚠️ Important Notes

1. **Keep the structure:** Don't remove commas, brackets, or quotes
2. **Use strings:** Text values must be in quotes: `'Your Text'`
3. **Save the file:** After editing, save `Rivals.js`
4. **Refresh browser:** Reload the page to see changes
5. **Backup first:** Make a copy of `Rivals.js` before making major changes

## 🔍 Quick Find Tips

- Use `Ctrl+F` (or `Cmd+F` on Mac) to search in `Rivals.js`
- Search for the hero's name or ID
- Look for the opening `{` of the hero object
- Make your changes between the `{` and `}` of that hero

## 📍 Exact Line Numbers

- **Vanguard Heroes:** Lines 576-726
- **Duelist Heroes:** Lines 728-1029
- **Strategist Heroes:** Lines 1031-1141

---

**Need help?** All hero data is in one place: `Rivals.js` starting at line 576. Just find your hero and edit the properties!




