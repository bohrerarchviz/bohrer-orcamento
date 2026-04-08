export interface BudgetFormData {
  // Step 1: Basic Info
  clientName: string;
  companyName: string;
  projectName: string;
  email: string;
  phone: string;
  location: string;
  projectType: string;

  // Step 2: Services
  needsExternalImages: boolean;
  externalQuantity: string;
  externalViews: string[];
  externalViewsOther: string;
  externalMood: string;

  needsInteriorImages: boolean;
  interiorQuantity: string;
  interiorSpaces: string[];
  interiorSpacesOther: string;

  needsVideo: boolean;
  videoType: string;
  videoDuration: string;
  videoNotes: string;
  videoFormat: string; // Vertical, Horizontal
  videoEssential: string;
  videoTextOverlays: string; // Sim, Não
  videoStyle: string; // Conceitual, Comercial, Misto
  videoHasReferences: string; // Sim, Não
  videoReferencesDesc: string;

  needsPlantaHumanizada: boolean;
  plantaQuantity: string;
  plantaTypologies: string;

  // Step 3: Material
  isAlreadyModeled: boolean | null;
  fileFormat: string;
  availableMaterial: string[];
  materialsDefined: string; // Sim, Parcialmente, Não
  materialsNotes: string;

  // Step 4: Scene Development
  includeSurroundings: string; // Yes, Partially, No
  surroundingsNotes: string;
  includeHumanization: string; // Yes, Minimal Only, No
  humanizationNotes: string;

  // Step 5: Delivery
  deadline: string;
  additionalNotes: string;
  relevantFiles: File[];
}

export const INITIAL_FORM_DATA: BudgetFormData = {
  clientName: "",
  companyName: "",
  projectName: "",
  email: "",
  phone: "",
  location: "",
  projectType: "",
  needsExternalImages: false,
  externalQuantity: "",
  externalViews: [],
  externalViewsOther: "",
  externalMood: "",
  needsInteriorImages: false,
  interiorQuantity: "",
  interiorSpaces: [],
  interiorSpacesOther: "",
  needsVideo: false,
  videoType: "",
  videoDuration: "",
  videoNotes: "",
  videoFormat: "",
  videoEssential: "",
  videoTextOverlays: "",
  videoStyle: "",
  videoHasReferences: "",
  videoReferencesDesc: "",
  needsPlantaHumanizada: false,
  plantaQuantity: "",
  plantaTypologies: "",
  isAlreadyModeled: null,
  fileFormat: "",
  availableMaterial: [],
  materialsDefined: "",
  materialsNotes: "",
  includeSurroundings: "",
  surroundingsNotes: "",
  includeHumanization: "",
  humanizationNotes: "",
  deadline: "",
  additionalNotes: "",
  relevantFiles: [],
};
