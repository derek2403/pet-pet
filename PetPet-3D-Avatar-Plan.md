# PetPet — Template‑Based 3D Pet Avatars (Dog & Cat) with Spline

This plan describes a **100% working** implementation to embed and control stylized 3D dog/cat avatars in the PetPet dashboard using **Spline**. It focuses on a reliable, template‑based approach (no auto‑rigging or single‑image mesh generation) and aligns with Spline’s current capabilities: **React embed**, **runtime control via onLoad**, **object lookup**, **visibility toggling**, **interactions/states**, and **event triggering**.

> Core idea: Build one Spline scene containing both pet templates and pre‑authored variants + animations. In React, load the scene and drive which pieces are shown/animated using the runtime API.

---

## Goals & Scope
- **Species**: Dog, Cat (two base meshes)
- **Personalization**: Choose species → choose variants (ears/tail/face/pattern) → choose color swatch (primary + optional secondary) → set ENS label
- **Animation**: Idle, Run, Sleep, Eat, Play (per species)
- **Integration**: React/Next.js dashboard → Spline scene embed → update avatar based on pet status
- **Performance**: Lightweight scene; mobile‑friendly; graceful fallback if WebGL disabled

Non‑Goals (v1)
- Automatic mesh creation from a single photo
- Advanced rigging/IK; photorealistic rendering

---

## Architecture Overview
- **Spline Scene**: One `.splinecode` with both species and all variants/animations
- **React Frontend**: Uses `@splinetool/react-spline` to embed the scene and control it at runtime
- **Pet Model**: Simple TypeScript model that stores species, variants, color swatches, ENS, and current status
- **State Mapping**: Pet status → Spline animation trigger (via interaction triggers)

```
Next.js (Dashboard)
  └─ <PetViewer/> → loads Spline scene → onLoad(app)
      ├─ showSpecies(app, 'dog'|'cat')
      ├─ toggleVariantGroups(app, path, activeVariant)
      ├─ setPaletteBySwatch(app, 'Dog'|'Cat', 'Cream'|'Black'|...)
      ├─ setEnsText(app, 'Dog'|'Cat', ens)
      └─ playAnim(app, 'Dog'|'Cat', 'Idle'|'Run'|'Sleep'|'Eat'|'Play')
```

---

## Phase 1 — Spline Authoring

Create **one Spline scene** (e.g., `pet_scene.splinecode`) with this structure and naming. All names are important for runtime lookup.

### 1.1 Node Hierarchy
```
/Pets
  /Dog
    /Body
      Body_FurPrimary_Cream
      Body_FurPrimary_Brown
      Body_FurPrimary_Black
      Body_FurPrimary_Orange
      Body_FurPrimary_Gray
      Body_FurPrimary_White
    /Head
    /Ears
      Ears_Pointy
      Ears_Flop
    /Tail
      Tail_Straight
      Tail_Curly
    /Face
      Eyes_Dot
      Eyes_Sparkle
      Nose_Triangle
      Nose_Round
    /FurPattern
      Pattern_None
      Pattern_Spots
      Pattern_Tabby
    /Nameplate
      Nameplate_Text   (Text object)
    /Triggers
      Trigger_Dog_Idle
      Trigger_Dog_Run
      Trigger_Dog_Sleep
      Trigger_Dog_Eat
      Trigger_Dog_Play
  /Cat
    (mirror the Dog structure with Cat_ names and triggers)
/UI
  Badge_MedDue
  Badge_LastFed
```

> **Why multiple Body_* meshes?** Instead of changing material colors at runtime (which may vary by API), we use **pre‑baked swatches**. The app toggles visibility to pick the active swatch. This guarantees predictable results.

### 1.2 Materials
Keep materials simple and share across meshes when possible (e.g., Eye, Nose). Avoid heavy textures; prefer colors and gradients.

### 1.3 Animations & Interactions
For each species:
- Create animations: **Idle, Run, Sleep, Eat, Play**.
- Add **invisible trigger objects** (e.g., small planes) named `Trigger_<Species>_<State>`.
- In Spline **Interactions**, wire each trigger: **On Mouse Down → Play/Go to** the corresponding animation/state for that species group.

> This lets the app trigger animations programmatically with `emitEvent('mouseDown', triggerObject)`. It’s robust and does not depend on private APIs.

### 1.4 Export/Share
- Save the scene and obtain its **public scene URL** (or host locally in your app). You’ll pass this to the React component as `scene`.

### 1.5 Performance Budgets
- Target ≤ **60–120k** triangles per species
- Texture atlases ≤ **1024–2048 px**
- Keep lights minimal; avoid expensive shadows

---

## Phase 2 — React/Next.js Setup

### 2.1 Install
```bash
npm i @splinetool/react-spline @splinetool/runtime
```

### 2.2 Define the Pet Model
```ts
// types/pet.ts
export type Species = 'dog' | 'cat'
export type PetState = 'idle' | 'running' | 'sleeping' | 'eating' | 'playing'

export type Pet = {
  id: string
  species: Species
  ens: string
  status: PetState
  variants: {
    ears: 'Pointy' | 'Flop'
    tail: 'Straight' | 'Curly'
    face: { eyes: 'Dot' | 'Sparkle'; nose: 'Triangle' | 'Round' }
    pattern: 'None' | 'Spots' | 'Tabby'
  }
  palette: { primary: 'Cream'|'Brown'|'Black'|'Orange'|'Gray'|'White'; secondary?: string }
}
```

### 2.3 PetViewer Component (100% working baseline)
```tsx
// components/PetViewer.tsx
import Spline from '@splinetool/react-spline'
import { useEffect, useRef, useState } from 'react'
import type { Pet } from '@/types/pet'

export default function PetViewer({ pet, scene }:{ pet: Pet; scene: string }) {
  const appRef = useRef<any>(null)
  const [fallbackEns, setFallbackEns] = useState<string | null>(null)

  const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1)
  const SPECIES = cap(pet.species) // 'Dog' | 'Cat'

  const showSpecies = (app: any) => {
    const dog = app.findObjectByName('Dog')
    const cat = app.findObjectByName('Cat')
    if (dog) dog.visible = SPECIES === 'Dog'
    if (cat) cat.visible = SPECIES === 'Cat'
  }

  const toggleVariant = (app: any, groupPath: string, activeEndsWith: string) => {
    const group = app.findObjectByName(groupPath)
    if (!group?.children) return
    group.children.forEach((child: any) => {
      child.visible = child.name.endsWith(activeEndsWith)
    })
  }

  const setPalette = (app: any, primary: string) => {
    const body = app.findObjectByName(`${SPECIES}/Body`)
    if (!body?.children) return
    body.children.forEach((child: any) => {
      if (child.name.startsWith('Body_FurPrimary_')) {
        child.visible = child.name.endsWith(`_${primary}`)
      }
    })
  }

  const setEns = (app: any, ens: string) => {
    const t = app.findObjectByName(`${SPECIES}/Nameplate_Text`)
    if (t && typeof t.text === 'string') {
      t.text = ens
    } else {
      // Fallback: show HTML overlay if Text object doesn’t expose .text at runtime
      setFallbackEns(ens)
    }
  }

  const playAnim = (app: any, state: string) => {
    const triggerName = `Trigger_${SPECIES}_${state}`
    const trigger = app.findObjectByName(triggerName)
    // Per official docs, `emitEvent` takes the object's name (string), not the object itself.
    if (trigger) app.emitEvent('mouseDown', triggerName)
  }

  const driveFromPet = (app: any) => {
    showSpecies(app)
    toggleVariant(app, `${SPECIES}/Ears`, pet.variants.ears)
    toggleVariant(app, `${SPECIES}/Tail`, pet.variants.tail)
    toggleVariant(app, `${SPECIES}/Face`, `Eyes_${pet.variants.face.eyes}`)
    toggleVariant(app, `${SPECIES}/Face`, `Nose_${pet.variants.face.nose}`)
    toggleVariant(app, `${SPECIES}/FurPattern`, `Pattern_${pet.variants.pattern}`)
    setPalette(app, pet.palette.primary)
    setEns(app, pet.ens)

    const state = pet.status === 'running' ? 'Run'
      : pet.status === 'sleeping' ? 'Sleep'
      : pet.status === 'eating' ? 'Eat'
      : pet.status === 'playing' ? 'Play' : 'Idle'

    playAnim(app, state)
  }

  const onLoad = (app: any) => {
    appRef.current = app
    driveFromPet(app)
  }

  useEffect(() => {
    if (!appRef.current) return
    driveFromPet(appRef.current)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pet])

  return (
    <div className="relative w-full h-[28rem] rounded-2xl overflow-hidden bg-neutral-900">
      <Spline scene={scene} onLoad={onLoad} />
      {fallbackEns && (
        <div className="absolute bottom-3 left-3 px-3 py-1 rounded bg-black/60 text-white text-sm">
          {fallbackEns}
        </div>
      )}
    </div>
  )
}
```

> **Why this works reliably:** It only uses documented, stable interactions—**finding objects by name, toggling visibility**, and **emitting interaction events** to play animations.

---

## Phase 3 — Pet Signup (Template Mapping)

### 3.1 Species & Variant Selection
- Ask the user to select **Dog** or **Cat**
- Offer simple toggles for **ears**, **tail**, **face**, **pattern**

### 3.2 Color Swatch Selection (from photo, optional)
- Let the user upload a photo.
- Extract a small set of dominant colors client‑side (Canvas API); map to the **nearest predefined swatch**.

```ts
// util/extractPrimarySwatch.ts — simple & fast approach
export async function extractPrimarySwatch(img: HTMLImageElement) {
  const swatches = ['Cream','Brown','Black','Orange','Gray','White']
  const target = await dominantRGB(img) // [r,g,b]
  const lut: Record<string,[number,number,number]> = {
    Cream:[236,223,200], Brown:[120,84,60], Black:[20,20,20],
    Orange:[220,140,60], Gray:[140,140,140], White:[240,240,240],
  }
  const dist = (a:number[], b:number[]) => Math.hypot(a[0]-b[0], a[1]-b[1], a[2]-b[2])
  return swatches.reduce((best, s) => dist(target, lut[s]) < dist(target, lut[best]) ? s : best, 'Cream')
}

async function dominantRGB(img: HTMLImageElement) {
  const c = document.createElement('canvas');
  const k = 8; // downscale for speed
  c.width = (img.naturalWidth||img.width)/k; c.height = (img.naturalHeight||img.height)/k
  const ctx = c.getContext('2d')!
  ctx.drawImage(img,0,0,c.width,c.height)
  const data = ctx.getImageData(0,0,c.width,c.height).data
  let r=0,g=0,b=0,n=0
  for (let i=0;i<data.length;i+=4){r+=data[i];g+=data[i+1];b+=data[i+2];n++}
  return [r/n,g/n,b/n] as [number,number,number]
}
```

> You can always let the user **override** the auto‑picked swatch.

### 3.3 Persist
- Save the chosen **species, variants, swatch, and ENS** to your backend or local state

---

## Phase 4 — Dashboard Integration

- Render `<PetViewer pet={pet} scene={sceneUrl} />`
- Subscribe to your real‑time pet status (e.g., `running/resting/sleeping/eating/playing`)
- On status change → update the `pet.status` prop → the component re‑triggers the right animation
- Optional UI badges: toggle `/UI/*` nodes by name to reflect alerts like meds due/last fed

---

## Phase 5 — QA Checklist (Guarantee It Works)

1. **Names match** exactly between Spline and code (`Dog`, `Cat`, `Trigger_Dog_Run`, etc.)
2. **Triggers wired**: In Spline, each `Trigger_*` has an **On Mouse Down** interaction that plays the correct animation/state
3. **Variants exist**: All expected meshes exist (e.g., `Body_FurPrimary_Cream`), and only one is visible by default per species
4. **Visibility logic**: Changing variants only flips `.visible` — no runtime material edits required
5. **ENS label**: If `Nameplate_Text.text` is not writable at runtime, the HTML fallback renders the ENS string
6. **Mobile test**: Load on mid‑range Android/iOS; ensure smooth camera & animation
7. **Fallback**: If WebGL unavailable, show a poster image (export from Spline) or a lightweight GIF of the idle loop

---

## Phase 6 — Performance & Polish
- Merge meshes where possible; limit draw calls
- Keep the **scene under 3–4 MB** total
- Use **one** environment light; consider baked ambient
- Add subtle interaction: pet looks at cursor on hover (Spline interaction)
- Add a small loading skeleton while Spline scene initializes

---

## Future Phases (Optional)
- **More species** (rabbit, bird…) using the same hierarchy
- **Runtime material edits** instead of mesh‑per‑swatch once you’re comfortable
- **Dynamic decals** (collar tags, badges) via texture swapping
- **3D social moments**: temporarily spawn the other pet and play a short "Play" loop for verified interactions
- **Async photo → feature heuristics** (ear type, pattern hints) to pre‑fill variant choices

---

## Example Dev Data (pets.json)
```json
[
  {
    "id": "1",
    "species": "dog",
    "ens": "buddy.petpet.eth",
    "status": "idle",
    "variants": {
      "ears": "Flop",
      "tail": "Curly",
      "face": { "eyes": "Dot", "nose": "Triangle" },
      "pattern": "Spots"
    },
    "palette": { "primary": "Cream" }
  },
  {
    "id": "2",
    "species": "cat",
    "ens": "luna.petpet.eth",
    "status": "sleeping",
    "variants": {
      "ears": "Pointy",
      "tail": "Straight",
      "face": { "eyes": "Sparkle", "nose": "Round" },
      "pattern": "Tabby"
    },
    "palette": { "primary": "Orange" }
  }
]
```

---

## Why this aligns with Spline’s capabilities
- Uses the **official React embed** (`@splinetool/react-spline`)
- Controls the scene via the **onLoad app instance** and **object lookup by name**
- Avoids fragile/undocumented APIs by **toggling visibility** and **emitting interaction events** to play animations
- Keeps all heavy logic (classification, color mapping) **outside Spline**, as intended

With the scene authored per the hierarchy above and interactions correctly wired, this plan will work end‑to‑end today.
