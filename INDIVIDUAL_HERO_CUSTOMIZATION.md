# Individual Hero Customization Guide

This guide shows you how to customize **each hero individually** with their own unique stats, abilities, health, attack type, and difficulty - overriding the default templates.

## 📍 Location

All hero data is in **`Rivals.js`** in these arrays:
- `vanguardHeroes` (starts around line 440)
- `duelistHeroes` (starts around line 728)
- `strategistHeroes` (starts around line 1031)

## 🎯 How It Works

The system uses **templates as defaults**, but you can **override them** for each hero by adding properties directly to the hero object. If you don't specify a property, it uses the template for that hero's category.

## ✅ Complete Hero Object Structure

Here's what you can customize for EACH hero individually:

```javascript
{
  id: 'hero-id',
  category: 'vanguard',  // or 'duelist' or 'strategist'
  name: 'Hero Name',
  tagline: 'Hero Tagline',
  summary: 'Hero summary',
  lore: 'Hero lore',
  portrait: 'Images/Portrait.jpg',
  card: 'Images/Card.jpg',           // ⭐ Optional: separate card image
  background: 'Images/Background.jpg',
  accent: '#ff9cd6',
  realName: 'Real Name',
  
  // ⭐ INDIVIDUAL CUSTOMIZATION - Override templates:
  attackType: 'Custom Attack Type',  // Override category template
  health: '300',                     // Override category template
  difficulty: '★★★★★',              // Override category template
  
  // ⭐ INDIVIDUAL STATS - Override category template
  stats: [
    { label: 'Difficulty', value: '★★★★★' },
    { label: 'Durability', value: 'Very High' },
    { label: 'Mobility', value: 'High' },
    { label: 'Utility', value: 'Custom Utility' }
  ],
  
  // ⭐ INDIVIDUAL ABILITIES/SKILLS - Override category template
  abilities: [
    { 
      name: 'Custom Skill 1', 
      description: 'Custom skill description here.',
      slot: 'LMB',      // Optional: 'LMB', 'E', 'Q', 'RMB', etc.
      type: 'Primary'   // Optional: 'Primary', 'Skill', 'Ultimate', 'Secondary'
    },
    { 
      name: 'Custom Skill 2', 
      description: 'Another custom skill description.'
    },
    { 
      name: 'Custom Skill 3', 
      description: 'Third custom skill description.'
    }
  ]
}
```

## 📝 Step-by-Step: Customizing Individual Heroes

### Example 1: Angela (Already Has Custom Stats & Abilities)

```javascript
{
  id: 'angela',
  category: 'vanguard',
  name: 'Angela',
  tagline: 'Radiant Spear Vanguard',
  summary: 'A celestial frontliner...',
  lore: 'Angela, the Hunter of Heven...',
  portrait: 'Images/PAngela.jpg',
  background: 'Images/KunLun.jpg',
  accent: '#ff9cd6',
  realName: 'Aldrif Odinsdottir',
  
  // ⭐ CUSTOM ATTACK TYPE (overrides vanguard template)
  attackType: 'Melee Heroes',
  
  // ⭐ CUSTOM HEALTH (overrides vanguard template of '275')
  health: '275',
  
  // ⭐ CUSTOM STATS (overrides vanguard template)
  stats: [
    { label: 'Difficulty', value: '★★★☆☆' },
    { label: 'Durability', value: 'High' },
    { label: 'Mobility', value: 'Leaping' },
    { label: 'Utility', value: 'Barrier Field' }
  ],
  
  // ⭐ CUSTOM ABILITIES (overrides vanguard template)
  abilities: [
    { name: 'Hevenward Lunge', description: 'Throw the spear forward, then warp to it, staggering the first target struck.' },
    { name: 'Celestial Bulwark', description: 'Create a rotating shield halo that blocks projectiles for nearby allies.' },
    { name: 'Choir of Spears', description: 'Summon a barrage of radiant blades that pin enemies in a circle and grant allies lifesteal.' }
  ]
}
```

### Example 2: Moon Knight (Custom Everything)

```javascript
{
  id: 'moon-knight',
  category: 'duelist',
  name: 'Moon Knight',
  tagline: 'Lunar Duelist',
  summary: 'If you see an enemy that others cannot see... TAKE IT DOWN!',
  lore: 'As the avatar of the Egyptian God of Vengeance...',
  portrait: 'Images/Moon.png',
  card: 'Images/MoonSilhouette.png',  // ⭐ Custom card image
  background: 'Images/MoonStory.png',
  accent: '#b7c7ff',
  realName: 'Marc Spector, Jake Lockley, Steven Grant',
  
  // ⭐ CUSTOM ATTACK TYPE
  attackType: 'Projectile Heroes',
  
  // ⭐ CUSTOM HEALTH (overrides duelist template of '250')
  health: '280',
  
  // ⭐ CUSTOM DIFFICULTY (overrides duelist template)
  difficulty: '★★★★★',
  
  // ⭐ CUSTOM STATS
  stats: [
    { label: 'Difficulty', value: '★★★★★' },
    { label: 'Burst', value: 'Extreme' },
    { label: 'Mobility', value: 'Very High' },
    { label: 'Sustain', value: 'Medium' }
  ],
  
  // ⭐ CUSTOM ABILITIES
  abilities: [
    { 
      name: 'Crescent Glaive', 
      description: 'Throw a crescent glaive that bounces between enemies.',
      slot: 'LMB',
      type: 'Primary'
    },
    { 
      name: 'Lunar Phase', 
      description: 'Transform between different phases, each with unique abilities.',
      slot: 'E',
      type: 'Skill'
    },
    { 
      name: 'Khonshu\'s Wrath', 
      description: 'Channel the power of Khonshu to unleash devastating attacks.',
      slot: 'Q',
      type: 'Ultimate'
    }
  ]
}
```

### Example 3: Hero Using Default Templates (No Customization)

```javascript
{
  id: 'she-hulk',
  category: 'vanguard',
  name: 'She-Hulk',
  tagline: 'Courtroom Crusher',
  summary: 'Uses seismic grapples...',
  lore: 'Jennifer Walters turns litigation...',
  portrait: 'Images/PVenom.jpg',
  background: 'Images/New5.png',
  accent: '#6dd36a',
  realName: 'Jennifer Walters'
  // ⭐ No custom properties = uses vanguard templates:
  // - attackType: 'Melee Heroes' (from template)
  // - health: '275' (from template)
  // - difficulty: '★★★☆☆' (from template)
  // - stats: vanguard template stats
  // - abilities: vanguard template abilities
}
```

## 🎨 Customization Options

### 1. Custom Attack Type

```javascript
{
  id: 'hero-id',
  attackType: 'Melee Heroes',        // Custom attack type
  // OR
  attackType: 'Projectile Heroes',   // Different type
  // OR
  attackType: 'Hybrid Striker',      // Unique type
  // If not specified: uses category template
}
```

### 2. Custom Health

```javascript
{
  id: 'hero-id',
  health: '300',  // Custom health value (string)
  // If not specified: uses category template (vanguard: '275', duelist: '250', strategist: '240')
}
```

### 3. Custom Difficulty

```javascript
{
  id: 'hero-id',
  difficulty: '★★★★★',  // 1-5 stars
  // If not specified: uses category template or from stats
}
```

### 4. Custom Stats Array

```javascript
{
  id: 'hero-id',
  stats: [
    { label: 'Difficulty', value: '★★★★★' },
    { label: 'Durability', value: 'Very High' },
    { label: 'Mobility', value: 'High' },
    { label: 'Utility', value: 'Custom Value' },
    { label: 'Custom Stat', value: 'Custom Value' }  // You can add more!
  ],
  // If not specified: uses category template stats
}
```

### 5. Custom Abilities/Skills Array

```javascript
{
  id: 'hero-id',
  abilities: [
    { 
      name: 'Skill Name 1', 
      description: 'Skill description 1',
      slot: 'LMB',      // Optional: 'LMB', 'E', 'Q', 'RMB', 'Shift', etc.
      type: 'Primary'   // Optional: 'Primary', 'Skill', 'Ultimate', 'Secondary'
    },
    { 
      name: 'Skill Name 2', 
      description: 'Skill description 2',
      slot: 'E',
      type: 'Skill'
    },
    { 
      name: 'Skill Name 3', 
      description: 'Skill description 3',
      slot: 'Q',
      type: 'Ultimate'
    }
    // Add as many skills as you want!
  ],
  // If not specified: uses category template abilities
}
```

## 📋 Default Templates (Used If Not Overridden)

### Vanguard Template:
- **Attack Type:** `'Melee Heroes'`
- **Health:** `'275'`
- **Difficulty:** `'★★★☆☆'`
- **Stats:** Difficulty, Durability, Mobility, Utility
- **Abilities:** Bulwark Advance, Guardian Pulse, Bastion Breaker

### Duelist Template:
- **Attack Type:** `'Burst Duelists'`
- **Health:** `'250'`
- **Difficulty:** `'★★★★☆'`
- **Stats:** Difficulty, Burst, Mobility, Sustain
- **Abilities:** Precision Combo, Momentum Flip, Showdown

### Strategist Template:
- **Attack Type:** `'Support Strategists'`
- **Health:** `'240'`
- **Difficulty:** `'★★★☆☆'`
- **Stats:** Difficulty, Control, Support, Vision
- **Abilities:** Command Uplink, Planar Shift, Grand Stratagem

## 💡 Quick Reference

**To customize a hero individually, just add these properties to the hero object:**

```javascript
{
  id: 'hero-id',
  // ... basic info ...
  
  // Add these to override templates:
  attackType: 'Your Custom Type',
  health: 'Your Health',
  difficulty: '★★★★★',
  stats: [ /* your custom stats */ ],
  abilities: [ /* your custom abilities */ ]
}
```

## 🎯 Real Example: Customizing a Hero

Let's say you want to customize "She-Hulk" with her own stats and abilities:

```javascript
{
  id: 'she-hulk',
  category: 'vanguard',
  name: 'She-Hulk',
  tagline: 'Courtroom Crusher',
  summary: 'Uses seismic grapples, courtroom objections that taunt foes, and unstoppable slams that open objectives.',
  lore: 'Jennifer Walters turns litigation into literal ground control—slamming the gavel before enemies can even raise their case.',
  portrait: 'Images/PVenom.jpg',
  background: 'Images/New5.png',
  accent: '#6dd36a',
  realName: 'Jennifer Walters',
  
  // ⭐ ADD CUSTOM PROPERTIES:
  attackType: 'Melee Heroes',
  health: '300',  // Higher than default vanguard (275)
  difficulty: '★★☆☆☆',  // Easier than default
  
  // ⭐ CUSTOM STATS
  stats: [
    { label: 'Difficulty', value: '★★☆☆☆' },
    { label: 'Durability', value: 'Extremely High' },
    { label: 'Mobility', value: 'Medium' },
    { label: 'Utility', value: 'Ground Control' }
  ],
  
  // ⭐ CUSTOM ABILITIES
  abilities: [
    { 
      name: 'Seismic Slam', 
      description: 'Jump and slam the ground, creating a shockwave that damages and stuns enemies.',
      slot: 'LMB',
      type: 'Primary'
    },
    { 
      name: 'Objection!', 
      description: 'Shout "Objection!" to taunt nearby enemies, forcing them to attack you.',
      slot: 'E',
      type: 'Skill'
    },
    { 
      name: 'Gavel Strike', 
      description: 'Slam a massive gavel down, dealing massive damage in a large area.',
      slot: 'Q',
      type: 'Ultimate'
    }
  ]
}
```

## ⚠️ Important Notes

1. **Templates are defaults** - If you don't specify a property, it uses the category template
2. **Override individually** - Each hero can have completely different stats/abilities
3. **Mix and match** - You can override some properties and use templates for others
4. **No limits** - Add as many stats or abilities as you want
5. **Save and refresh** - Always save `Rivals.js` and refresh the browser to see changes

## 🔍 Finding Heroes to Edit

1. Open `Rivals.js`
2. Search for the hero name (e.g., `'she-hulk'`)
3. Find the hero object `{ id: 'she-hulk', ... }`
4. Add custom properties inside that object
5. Save and refresh

---

**Summary:** Just add `attackType`, `health`, `difficulty`, `stats`, and `abilities` properties directly to each hero object in `Rivals.js` to customize them individually!

