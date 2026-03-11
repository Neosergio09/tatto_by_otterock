/**
 * Otterock Custom Engine - Internal SDK
 * 
 * A reusable kit containing the core Otterock interactions and API connectivity.
 * This can be copy-pasted into any new custom frontend or eventually published as a package.
 */

// --- TYPES ---
export interface ConsultationPayload {
  profile_id: string;
  name: string;
  email: string;
  whatsapp: string;
  body_part: string;
  size_cm: number;
  style: string;
  description: string;
  image?: File | null;
}

export interface SubmitResponse {
  success?: boolean;
  error?: string;
  details?: string;
}

// --- FORM SUBMITTER ---
/**
 * Submit a consultation to the Otterock Master Brain.
 * Agnostic to the UI implementation.
 */
export async function submitConsultation(
  endpointUrl: string,
  payload: ConsultationPayload
): Promise<SubmitResponse> {
  const formData = new FormData();
  formData.append('profile_id', payload.profile_id);
  formData.append('name', payload.name);
  formData.append('email', payload.email);
  formData.append('whatsapp', payload.whatsapp);
  formData.append('body_part', payload.body_part);
  formData.append('size_cm', payload.size_cm.toString());
  formData.append('style', payload.style);
  formData.append('description', payload.description);
  
  if (payload.image) {
    formData.append('image', payload.image);
  }

  try {
    const response = await fetch(endpointUrl, {
      method: 'POST',
      body: formData,
    });
    
    // In Astro/Vercel SSR, errors might not be JSON if it crashed before our handler
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || 'Server error');
      }
      return result;
    } else {
      const text = await response.text();
      throw new Error(`Unexpected server response: ${response.status} - ${text.substring(0, 100)}`);
    }
  } catch (error: any) {
    console.error('Otterock SDK Submit Error:', error);
    return { error: error.message || 'Network error' };
  }
}

// --- 3D MANNEQUIN STATE MANAGER ---
/**
 * Encapsulates the logic to communicate between UI forms and the 3D WebGL context.
 */
export class OtterockMannequinState {
  static selectBodyPart(partName: string) {
    // Dispatches a global event that the 3D scene (e.g. BodyPicker3D.astro) listens to
    const event = new CustomEvent('formBodyPartChanged', { 
      detail: { partName } 
    });
    if (typeof window !== 'undefined') {
      window.dispatchEvent(event);
    }
  }

  static listenForSelection(callback: (partName: string) => void) {
    if (typeof window !== 'undefined') {
      window.addEventListener('bodyPartSelected', ((e: CustomEvent) => {
        callback(e.detail.partName);
      }) as EventListener);
    }
  }
}

// --- SIGNATURE ANIMATIONS ---
/**
 * Hooks into the existing interactive cursor/snake if present on the page.
 * Keeps the "Social Distance" flavor intact across clients.
 */
export class OtterockCursorFX {
  static triggerHighlight() {
    if (typeof window !== 'undefined') {
      const event = new CustomEvent('otterockCursorHighlight');
      window.dispatchEvent(event);
    }
  }
}
