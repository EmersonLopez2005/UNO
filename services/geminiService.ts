import { GoogleGenAI } from "@google/genai";
import { PosterRequest, MerchRequest, ArtPosterRequest } from "../types";

export class GeminiService {
  /**
   * Maps UI aspect ratios to those strictly supported by the Gemini Image Generation API.
   * Supported: '1:1', '2:3', '3:2', '4:3', '3:4', '4:5', '5:4', '9:16', '16:9', '21:9'
   */
  private mapAspectRatio(ratio: string): any {
    const mapping: Record<string, string> = {
      '2:3': '2:3',
      '3:4': '3:4',
      '4:3': '4:3',
      '9:16': '9:16',
      '16:9': '16:9',
      '1:1': '1:1',
      '21:9': '21:9'
    };
    return (mapping[ratio] || ratio) as any;
  }

  private constructPosterPrompt(request: PosterRequest): string {
    const { carModel1, carModel2, livery, perspective, posterStyle, generationFormat, customPattern, carReferenceImage, carReferenceImage2 } = request;
    
    // Positioning instructions for logos
    const logoPositioning = `
      LOGO PLACEMENT RULES:
      - SPONSOR LOGO: Must be placed on core body positions, specifically the large side door panels and the center of the front hood.
      - TEAM LOGO: Must be placed on the rear wing endplates, above the front badge, on both sides of the front nose, and centered on the roof.
    `;

    if (generationFormat === 'THREE_VIEW') {
      return `(Professional Automotive Technical Livery Spec Sheet, 8k, Flat Design Style).
        SUBJECT: Technical 3-view orthographic projection of a high-performance ${carModel1} racing car.
        LAYOUT: 
        - LEFT: A large Top-Down View showing the full roof and hood livery.
        - RIGHT COLUMN: A sharp Front View and a clean Side Profile View (Left Side).
        VISUAL STYLE: Clean graphic illustration on a pure white background. Minimalist shading to emphasize the livery design and body lines.
        LIVERY MAPPING: 
        1. Apply the provided "Livery Pattern" (customPattern) across the entire body.
        2. ${logoPositioning}
        3. Match the color palette to the uploaded reference car livery: ${livery}.
        STRICT: This is a 2D technical layout. No perspective distortion. No environment.
        STRICT: NO TEXT, NO TITLES, NO SLOGANS. Only the car and its branding logos.`;
    }

    let envDescription = "";
    switch(posterStyle) {
      case 'RACE':
        envDescription = "High-speed racing action on a world-class FIA grade racetrack with motion blur asphalt and glowing brake discs.";
        break;
      case 'GARAGE':
        envDescription = `Vast, ultra-high-end professional racing headquarters factory workshop. 
          ENVIRONMENT DETAIL:
          - ARCHITECTURE: Minimalist, massive multi-level industrial design. 
          - MEZZANINE: A visible **second-floor garage office** with floor-to-ceiling glass partitions overlooking the workshop floor. The office interior should have soft ambient lighting and silhouettes of workstation screens.
          - WALL BRANDING: The **Team Logo** must be prominently integrated onto the primary structural walls as a large-scale high-end architectural sign (brushed metal or back-lit LED) or etched into the glass of the upper mezzanine office.
          - FLOOR: Polished **gray industrial concrete** with subtle, elegant reflections of the overhead lighting.
          - ASSETS: Organized stacks of racing tire slicks on bespoke matte-black racks, arrays of high-tech tool chests with premium carbon fiber finishes. A cluster of glowing telemetry monitors on a mobile workstation should be visible in the mid-ground.
          - LIGHTING: Broad, cinematic linear LED strips integrated into the ceiling, creating sharp, high-contrast highlights on the car's silhouette.
          - ATMOSPHERE: Clinical, expensive, hyper-organized factory headquarters atmosphere.`;
        break;
      case 'PADDOCK':
        envDescription = `Professional high-end Racing Paddock Garage interior, hyper-organized and technologically advanced.
          ENVIRONMENT DETAIL:
          - CEILING: Massive, high-precision overhead lightbox panels arranged in a clean geometric grid, providing clinical, soft-shadow lighting.
          - FLOOR: Ultra-high-gloss dark charcoal polished epoxy floor with razor-sharp mirror reflections of the cars and the surrounding branding.
          - WALL STRUCTURE (MODULAR PARTITIONS): 
            The space is defined by thick, high-end modular partition walls with back-lit glowing panels. 
            The walls feature large-scale integrated branding: The **Sponsor Logo** and **Team Logo** must appear as bold, back-lit architectural elements (glowing neon-sign style or premium printed decals) integrated directly into the surface of the yellow-toned or branded partition panels.
          - PADDOCK WALL DESIGN: 
            ${customPattern ? 'Replicate the exact graphic motifs and design DNA from the uploaded "Pattern Reference" (customPattern) across the surface of the primary partition wall panels.' : 'The walls should reflect the color palette and geometric DNA of the primary racing car livery.'}
          - ASSETS & EQUIPMENT (SYMMETRICAL ARRANGEMENT):
            1. **TIRE STACKS**: Neatly arranged stacks of professional racing slicks on vertical matte-black tire trolleys and racks, positioned symmetrically on both the left and right sides of the bay.
            2. **TOOL CHESTS**: Professional-grade, multi-drawer racing tool cabinets in matte black or carbon-fiber finish, positioned against the back and side walls.
            3. **MOBILE WORKSTATIONS**: A high-tech mobile computer workstation or telemetry cart visible in the periphery.
          - ATMOSPHERE: High-pressure race-day focus. Clinical, structural, and structurally substantial with deep perspective layers.`;
        break;
      case 'LAUNCH':
        envDescription = "Minimalist high-end professional automotive photography studio. Pure white infinite floor and background. Soft, broad overhead softbox lighting creating elegant highlight gradients along the car's body. Sharp contact shadows on the floor. 8k ultra-sharp detail.";
        break;
    }

    // Reference prioritization logic
    let subjectDescription = `SUBJECT: A high-performance ${carModel1} racing car.`;
    if (carReferenceImage2) {
      const placement = posterStyle === 'PADDOCK' || posterStyle === 'GARAGE'
        ? "The two cars must be positioned SIDE-BY-SIDE (parallel) inside the bay, facing the camera, perfectly aligned like a factory racing team." 
        : "The lead car is in front, and the chase car is slightly behind/to the side.";
      
      subjectDescription = `SUBJECT: TWO high-performance racing cars. 
        - LEAD CAR (PRIMARY): Must look exactly like the first uploaded "Car Reference Image".
        - CHASE/SUPPORT CAR: Must look like the second uploaded "Car Reference Image".
        PLACEMENT: ${placement}`;
    } else if (carModel2) {
      subjectDescription = `SUBJECT: A dynamic pair of ${carModel1} and ${carModel2} racing cars.`;
    }

    // Livery prioritization logic
    const liveryInstruction = customPattern 
      ? `LIVERY (TOP PRIORITY): Analyze the provided "Pattern Reference" (customPattern) image. You MUST extract its exact color palette, graphic motifs, and design DNA. Map this specific design precisely onto the aerodynamic body of the ${carModel1}. ${logoPositioning} Supplement with these notes: ${livery}.`
      : `LIVERY: ${livery}. ${logoPositioning} Ensure all brand colors and aerodynamic details are sharp.`;

    return `(Professional Motorsport CGI, 8k Ultra-High Resolution, Masterpiece Photorealistic Render).
      ${subjectDescription}
      ${liveryInstruction}
      PERSPECTIVE: ${perspective}.
      ENVIRONMENT: ${envDescription}
      VISUALS: Cinematic lighting, realistic ray-traced reflections on car paint and windows, high-fidelity textures.
      STRICT: NO TEXT, NO TITLES, NO SLOGANS. The generated image MUST NOT contain any words, fonts, titles, or slogans other than the provided brand logos.
      STRICT: The entire car body must be fully visible and centered within the frame. No clipping.`;
  }

  private constructArtPosterPrompt(request: ArtPosterRequest): string {
    const { style, eventLogo, sponsorLogo, teamLogo, styleCustomPrompt, userSupplement, carImage, carImage2, styleReferenceImage } = request;
    
    const hasSecondCar = !!carImage2;
    const carCount = hasSecondCar ? "TWO high-performance racing cars" : "ONE high-performance racing car";
    const sourceRefs = hasSecondCar ? "\"Car Image 1\" and \"Car Image 2\"" : "\"Car Image\"";

    const subjectDescription = `
      SUBJECT: ${carCount} as identified from the provided ${sourceRefs}. 
      CRITICAL DETAIL REQUIREMENT: For ${hasSecondCar ? 'EACH' : 'the'} car, you MUST replicate every detail of its aerodynamic body and livery patterns but stylized into the chosen artistic medium.
    `;

    let styleDescription = "";

    if (style === 'STYLE_TRANSFER') {
      styleDescription = `
        STYLE: ARTISTIC DNA REPLICATION.
        ${styleCustomPrompt ? `CORE STYLE DNA: "${styleCustomPrompt}".` : 'Analyze the provided "Style Reference Image" to extract artistic technique and composition.'}
        ${userSupplement ? `ADDITIONAL USER INSTRUCTIONS: "${userSupplement}".` : ''}
        COLOR LOGIC (MANDATORY): Analyze the "Car Image" and extract its specific livery color palette (the brand colors). 
        The background, environment, and artistic effects of the new poster MUST use the extracted colors from the CAR LIVERY to ensure brand harmony.
        EXECUTION: Render the car from the "Car Image" into a scene that clones the artistic atmosphere, brushwork, and layout described in the DNA but uses the car's color palette for all environment elements.
      `;
    } else {
      switch(style) {
        case 'ILLUSTRATION':
          styleDescription = `STYLE: Dynamic Motorsport Vector Illustration. High-impact perspective with converging radial speed lines.`;
          break;
        case 'MINIMALIST_ILLUSTRATION':
          styleDescription = `
            STYLE: Masterful High-Contrast Minimalist Flat Vector Illustration.
            TECHICQUE: 100% Flat color blocks with zero gradients, zero textures, and zero soft shading.
            SHADOW LOGIC: Use large, solid black graphic shadows with perfectly sharp, hard-edged shadows to define the car's form and its contact with the ground. Shadows are a primary structural element of the composition.
            ENVIRONMENT: Ultra-minimalist graphic space. A simple, solid primary-color field (Bold Blue, Vibrant Red, or Minimalist Gray). 
            COMPOSITION: Iconic, centered framing. The car is treated as a bold graphic object, similar to a high-end vintage poster or modern sticker art.
            COLOR PALETTE: Highly saturated primary colors (Red, Yellow, Blue) with deep black accents for shadows.
            STRICT: NO TEXT, NO SLOGANS. Only the car and provided logos.
          `;
          break;
        case 'COEN_POHL':
          styleDescription = `
            STYLE: Modern Geometric Perspective Vector Illustration.
            TECHNIQUE: Expert use of clean, sharp vector shapes to create deep architectural storytelling. Focus on dramatic isometric or high-converging perspective.
            VISUALS: The car is seamlessly integrated into a highly organized environment. Environment archetypes:
            - A sun-drenched European coastal street with pastel-colored buildings and sharp terracotta shadows.
            - A cozy modern interior with large arched windows, lush indoor greenery, and warm sunbeams creating bold graphic shadows on the floor.
            - A surreal minimalist landscape featuring oversized everyday objects (like keys or tech) blended with organic elements like bamboo or rivers.
            SHADOWS: Dramatic, hard-edged solid-color shadows (deep blues, rich ochres) that define the architectural volume.
            COLOR PALETTE: Vibrant, saturated, and sophisticated. Saturated primaries mixed with soft creamy neutrals and atmospheric shadow tones.
            ATMOSPHERE: Serene, nostalgic "Lofi" aesthetic but with high-end graphical precision.
          `;
          break;
        case 'REALISTIC':
          styleDescription = `
            STYLE: Professional Automotive Technical Design Sheet.
            LAYOUT: A multi-view composition within a single frame. 
            - PRIMARY VIEW: A large, clean perspective view of the car as the centerpiece.
            - SECONDARY VIEWS: Two smaller inset panels showing a rear-quarter view and a technical close-up of a specific component (e.g., a racing wheel or rear aero wing).
            VISUAL TECHNIQUE: High-end Technical Vector Illustration. Use flat, clean cel-shading with sharp, hard-edged shadows. No photorealistic gradients; use bold, solid color fills.
            BACKGROUND: A minimalist, clean desaturated infinite space.
            GRAPHIC ACCENTS: Integrate bold, sharp diagonal geometric shapes (parallelograms and racing stripes) into the background. Use the primary and accent colors from the car's livery for these geometric shapes.
            STRICT: NO TEXT, NO TITLES, NO SLOGANS, NO NUMBERS, NO LABELS. The poster must be purely visual.
          `;
          break;
        case 'LAUNCH_CLOSEUP':
          styleDescription = `STYLE: High-End Ultra-Minimalist Studio Launch. A pure, infinite and void-like environment.`;
          break;
        case 'NEON_NIGHT':
          styleDescription = `STYLE: Neo-Cyberpunk Night Racing. High-saturation neon reflections on wet asphalt.`;
          break;
        case 'SURREALIST':
          styleDescription = `
            STYLE: Hiroshi Nagai City Pop Aesthetic (1980s Japanese Resort Illustration).
            TECHNIQUE: Clean, flat colors, minimalist shading, and hard-edged shadows. Masterful use of vibrant color gradients.
            ENVIRONMENT: Professional Racing Circuit. A pristine, high-end racetrack under a brilliant, clear sun. 
            SCENE ELEMENTS: Focus on the architectural and technical beauty of the circuit—a clean gray asphalt track surface, bold red-and-white (or blue-and-white) checkered curb markers, minimalist modern pit lane structures, and sleek empty grandstands in the distance. 
            SKY: A crystal-clear, deep cobalt blue sky featuring subtle, elegant horizontal gradients characteristic of 80s pop art.
            COMPOSITION: The car is the focal point, parked or cruising on the perfectly clean track. No beach or leisure elements. 
            LIGHTING: Bright, clear midday sun creating high-contrast, sharp shadows on the ground and car body.
            ATMOSPHERE: Serene, nostalgic, high-end 80s professional racing vibe.
            COLOR PALETTE: Dominant cobalt blue, turquoise, vibrant track-marker colors, and pastel accents. The car's livery should be adapted to this flat, graphic style while maintaining its original color scheme.
          `;
          break;
        case 'HOLOGRAPHIC':
          styleDescription = `STYLE: Futuristic Holographic Iridescent Illustration.`;
          break;
        case 'COMIC_BOOM':
          styleDescription = `
            STYLE: Professional Single-Frame Motorsport Art (Dynamic City Racing Painting).
            LAYOUT: A single, grand, ultra-cinematic wide-angle frame.
            SCENE: The car is captured in an aggressive, high-speed drift or corner entry through a towering metropolitan street circuit (Macau Grand Prix Macau Guia Circuit style).
            TECHNIQUE: A masterful fusion of digital realism and expressive, painterly brushwork. Visible impasto-like strokes on the environment and vibrant speed-trail effects. 
            LIGHTING: Sophisticated golden-hour sunset lighting casting warm orange highlights on the skyscrapers and sharp long shadows across the narrow track.
            BACKGROUND: A grand, sophisticated cream-colored (Beige) canvas aesthetic. Towering, high-rise architectural landmarks loom in the background with a slight architectural drawing feel.
            COLOR PALETTE: High-contrast. The car's livery must be the focal point with vibrant, glowing colors that pop against the neutral, warm, and sophisticated city environment.
            STRICT: NO TEXT, NO TITLES, NO SLOGANS. Only the car and branding logos.
          `;
          break;
        case 'SPEED_GRAFFITI':
          styleDescription = `
            STYLE: Clean Modern Vector Illustration (inspired by Hiroshi Nagai and Coen Pohl).
            TECHNIQUE: 100% Flat color blocking with zero gradients. Sharp, high-contrast, hard-edged solid black shadows. 
            ENVIRONMENT: Minimalist urban or professional racing scenery. Options include: 
            - A high-tech pit garage entrance with architectural lines.
            - A single stylized modern light tower against a vibrant saturated pink or cobalt blue sky.
            - A minimalist racetrack sector with bold asphalt markings and primary color barriers.
            - A clean coastal road with sharp yellow lane lines.
            COLOR PALETTE: High-saturation Pop Art colors. Deep blues, vibrant pinks, sun-drenched yellows, and turquoise.
            COMPOSITION: The car is integrated as a clean, graphical subject within this static, serene, and bold geometric environment.
            ATMOSPHERE: Serene, static, and graphically powerful. Minimalist but evocative.
          `;
          break;
      }
      
      if (styleCustomPrompt) {
        styleDescription += ` ADDITIONAL DESIGN NOTES: "${styleCustomPrompt}".`;
      }
    }

    let brandingInstruction = "";
    const hasAnyLogo = !!(eventLogo || sponsorLogo || teamLogo);

    if (hasAnyLogo) {
      brandingInstruction = `BRANDING: Integrate logos (Sponsor, Team, Event) professionally as decals on the car or graphic overlays. 
      STRICT: DO NOT add any text titles, slogans, or words that are not part of the provided logos.`;
    }

    return `(Professional High-Impact Motorsport Promotion Art, 8k resolution, Masterpiece).
      ${subjectDescription}
      VISUAL STYLE: ${styleDescription}
      ${brandingInstruction}
      STRICT: NO TEXT, NO TITLES, NO SLOGANS. 
      STRICT FRAMING: The entire car body must be fully contained within the frame.
      FINAL POLISH: Ensure a high-end commercial aesthetic.`;
  }

  async analyzeStyleDNA(styleRefImage: string, lang: 'en' | 'zh'): Promise<string> {
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const base64Data = styleRefImage.split(',')[1];
      
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: {
          parts: [
            { text: `Analyze the artistic DNA of this motorsport poster or art piece. Describe its visual technique (e.g., flat vector, oil painting, cinematic CGI, vintage illustration), lighting style, composition logic, brushwork, and overall atmospheric mood. Focus only on the STYLE, not the specific car model. Keep it concise (under 100 words) so it can be used as a prompt. IMPORTANT: Provide the response in ${lang === 'zh' ? 'Chinese' : 'English'}.` },
            { inlineData: { data: base64Data, mimeType: 'image/png' } }
          ]
        }
      });
      return response.text || "";
    } catch (error) {
      console.error("DNA Analysis Error:", error);
      throw error;
    }
  }

  private async callGemini(prompt: string, images: {data?: string, type: string}[], aspectRatio: string): Promise<string | null> {
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const parts: any[] = [{ text: prompt }];

      images.forEach(img => {
        if (img.data) {
          const base64Data = img.data.split(',')[1];
          parts.push({ inlineData: { data: base64Data, mimeType: 'image/png' } });
        }
      });

      const response = await ai.models.generateContent({
        model: 'gemini-3-pro-image-preview',
        contents: { parts: parts },
        config: { 
          imageConfig: { 
            aspectRatio: this.mapAspectRatio(aspectRatio), 
            imageSize: "1K" 
          } 
        },
      });

      for (const part of response.candidates?.[0]?.content?.parts || []) {
        if (part.inlineData) return `data:image/png;base64,${part.inlineData.data}`;
      }
      return null;
    } catch (error) {
      console.error("Gemini Generation Error:", error);
      throw error;
    }
  }

  async generateArtPoster(request: ArtPosterRequest): Promise<{url: string, prompt: string} | null> {
    const prompt = this.constructArtPosterPrompt(request);
    const images = [
      { data: request.carImage, type: 'car_image' },
      { data: request.carImage2, type: 'car_image_2' },
      { data: request.styleReferenceImage, type: 'style_ref' },
      { data: request.sponsorLogo, type: 'sponsor_logo' },
      { data: request.teamLogo, type: 'team_logo' },
      { data: request.eventLogo, type: 'event_logo' }
    ];
    const url = await this.callGemini(prompt, images, request.aspectRatio);
    return url ? { url, prompt } : null;
  }

  async generatePoster(request: PosterRequest): Promise<{url: string, prompt: string} | null> {
    const prompt = this.constructPosterPrompt(request);
    const images = [
      { data: request.carReferenceImage, type: 'car_ref' },
      { data: request.carReferenceImage2, type: 'car_ref_2' },
      { data: request.customPattern, type: 'pattern' },
      { data: request.sponsorLogo, type: 'sponsor' },
      { data: request.teamLogo, type: 'team' }
    ];
    const url = await this.callGemini(prompt, images, request.aspectRatio);
    return url ? { url, prompt } : null;
  }

  async generateMerch(request: MerchRequest): Promise<{url: string, prompt: string} | null> {
    let itemSpecificPrompt = "";
    
    if (request.itemType === 'CAR_MODEL') {
      itemSpecificPrompt = `
        CONCEPT: High-end collectible 1/18 scale diecast racing model figurine.
        VISUAL STYLE: Minimalist, clean, pure professional white studio background. 
        SUBJECT: A 1/18 scale miniature model of the provided car, featuring its exact livery and decals.
        PACKAGING: A premium, professional product collectible display box must be included in the scene, either positioned behind or next to the model car.
        BRANDING ON BOX: The provided **Team Logo** and **Sponsor Logo** must be clearly printed as high-quality graphic branding elements on the packaging box's surfaces.
        LIGHTING: Cinematic high-end studio product photography lighting. 
        STRICT: NO TEXT, NO TITLES, NO SLOGANS on the poster itself, only the logos as part of the box design.
      `;
    } else if (request.itemType === 'COFFEE') {
      itemSpecificPrompt = `
        CONCEPT: High-end professional product shot of racing-branded takeaway coffee.
        SCENE: Two premium coffee cups positioned on a minimalist, pure white studio background.
        SUBJECTS: 
        1. One transparent plastic takeaway cup containing an Iced Americano (dark coffee with clear visible ice cubes).
        2. One premium matte-finish paper cup for a hot Latte.
        BRANDING: Both cups feature a custom-designed wrap-around graphic label or sleeve.
        LABEL DESIGN LOGIC: 
        - The labels MUST integrate the provided **Team Logo** and **Sponsor Logo**.
        - ${request.patternReference ? "The graphic background design of the labels MUST be precisely derived from the design motifs and DNA of the provided 'Pattern Reference'." : "The graphic background design and color palette of the labels MUST match the specific livery design DNA and colors of the provided 'Car Reference'."}
        LIGHTING: Bright, clean, and clinical high-end studio product photography lighting with soft reflections on the plastic cup.
        STRICT: NO TEXT, NO TITLES, NO SLOGANS on the scene or labels, only the logos.
      `;
    } else if (request.itemType === 'SHORT_SLEEVE') {
      itemSpecificPrompt = `
        CONCEPT: Professional high-end "Racing Team Apparel" merchandise mockup.
        LAYOUT: A side-by-side presentation showing both the FRONT and BACK of a premium T-shirt in one frame.
        BASE COLOR: The T-shirt must be the color: ${request.baseColor || 'Pure Black'}.
        
        FRONT DESIGN:
        - Small, professional-grade logo placement on the chest.
        - The **Team Logo** must be placed on the LEFT CHEST.
        - The **Sponsor Logo** must be placed on the RIGHT CHEST.
        - Visual style: Minimalist and clean.
        
        BACK DESIGN:
        - A large, high-impact central graphic centered on the back.
        - The **Car from the 'Car Reference' image** must be the primary subject of this graphic.
        - BACKGROUND OF THE GRAPHIC: The **Team Logo** must appear as a large, stylized backdrop positioned directly BEHIND the car graphic.
        - ARTISTIC STYLE: ${request.styleDescription || 'Cinematic motorsport illustration with vibrant glows and dynamic lighting'}. 
        - ${request.patternReference ? 'Incorporate graphic motifs and color DNA from the provided "Pattern Reference" into the background of this large back-graphic.' : ''}
        
        VISUAL STYLE: Photorealistic product photography on a minimalist neutral studio background.
        STRICT: NO TEXT, NO TITLES, NO SLOGANS. Only the logos as specified.
      `;
    } else if (request.itemType === 'MERCH_COLLECTION') {
      itemSpecificPrompt = `
        CONCEPT: A professional high-end "Motorsport Brand Merchandise Collection" catalog sheet.
        LAYOUT: Organized product lineup visualization on a clean, aesthetically pleasing white background with subtle graphic accents like dots or geometric shadows.
        PRODUCTS TO INCLUDE IN THE LINEUP:
        1. **1/18 SCALE MODEL**: A precision model car with its branded display box.
        2. **APPAREL**: A high-end T-shirt and a professional team hoodie displayed flat or on minimalist invisible mannequins.
           - **COLOR REQUIREMENT**: These apparel items (T-shirt and Hoodie) MUST be produced in the specific base color: ${request.baseColor || 'Black'}.
        3. **ACCESSORIES**: A branded tote bag, a set of graphic keychains, and a circular hand fan.
        4. **LIFESTYLE**: An insulated stainless steel bottle or coffee mug.
        DESIGN DNA (TOP PRIORITY): All products MUST share a unified design theme. 
        - ${request.patternReference ? "Extract the exact pattern motifs, graphic DNA, and color palette from the provided 'Pattern Reference' and apply it cohesively across all product surfaces." : "Extract the color DNA and geometric racing motifs from the provided 'Car Reference' livery to style the entire collection."}
        BRANDING: Integrate the provided **Team Logo** and **Sponsor Logo** prominently and professionally on every item in the collection.
        VISUAL STYLE: Clean, bright, high-fidelity studio product photography.
        STRICT: NO TEXT, NO TITLES, NO SLOGANS. Only brand logos are permitted on the products.
      `;
    } else {
      itemSpecificPrompt = `Generate a high-end product visualization for a ${request.itemType} for a racing team. 
        The style should be consistent with professional motorsport merchandise photography.
        ${request.baseColor ? `Base color: ${request.baseColor}.` : ""}
        ${request.styleDescription ? `Additional style: ${request.styleDescription}.` : ""}
        STRICT: NO TEXT, NO TITLES, NO SLOGANS except logos already present on reference images.`;
    }

    const prompt = `(Professional Motorsport Merchandise Product Photography, 8k resolution, Masterpiece).
      ${itemSpecificPrompt}
      STRICT: The asset must look like a real, physical product.`;
    
    const images = [
      { data: request.carReference, type: 'car' },
      { data: request.patternReference, type: 'pattern' },
      { data: request.sponsorLogo, type: 'sponsor' },
      { data: request.teamLogo, type: 'team' }
    ];
    
    const url = await this.callGemini(prompt, images, request.aspectRatio);
    return url ? { url, prompt } : null;
  }
}

export const geminiService = new GeminiService();