import { useState, useMemo, ReactNode, useRef, useEffect, FormEvent, DragEvent, ChangeEvent } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Check, 
  ChevronRight, 
  ChevronLeft, 
  Send, 
  Copy, 
  CheckCircle2, 
  AlertCircle,
  Plus,
  FileText,
  Upload,
  File as FileIcon,
  X
} from "lucide-react";
import { BudgetFormData, INITIAL_FORM_DATA } from "../types";
import { cn } from "../lib/utils";
import { useLanguage } from "../lib/LanguageContext";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export default function BudgetForm() {
  const { t, language } = useLanguage();
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<BudgetFormData>(INITIAL_FORM_DATA);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isPdfGenerated, setIsPdfGenerated] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showFallback, setShowFallback] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const STEPS = t.budget.steps;

  const updateField = (field: keyof BudgetFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error for this field when updated
    if (errors[field]) {
      const newErrors = { ...errors };
      delete newErrors[field];
      setErrors(newErrors);
    }
  };

  const toggleList = (field: keyof BudgetFormData, value: string) => {
    const currentList = formData[field] as string[];
    let newList;
    if (currentList.includes(value)) {
      newList = currentList.filter(item => item !== value);
    } else {
      newList = [...currentList, value];
    }
    updateField(field, newList);
  };

  const validateStep = () => {
    const newErrors: Record<string, string> = {};

    if (currentStep === 0) {
      if (!formData.clientName) newErrors.clientName = t.budget.fieldRequired;
      if (!formData.projectName) newErrors.projectName = t.budget.fieldRequired;
      if (!formData.email) newErrors.email = t.budget.fieldRequired;
      if (!formData.projectType) newErrors.projectType = t.budget.fieldRequired;
    }

    if (currentStep === 1) {
      if (formData.needsExternalImages) {
        if (!formData.externalQuantity) newErrors.externalQuantity = t.budget.indicateQuantity;
        if (formData.externalViews.length === 0) newErrors.externalViews = t.budget.selectAtLeastOne;
      }
      if (formData.needsInteriorImages) {
        if (!formData.interiorQuantity) newErrors.interiorQuantity = t.budget.indicateQuantity;
        if (formData.interiorSpaces.length === 0) newErrors.interiorSpaces = t.budget.selectAtLeastOne;
      }
      if (formData.needsVideo) {
        if (!formData.videoType) newErrors.videoType = t.budget.fieldRequired;
        if (!formData.videoFormat) newErrors.videoFormat = t.budget.fieldRequired;
        if (!formData.videoEssential) newErrors.videoEssential = t.budget.fieldRequired;
        if (!formData.videoTextOverlays) newErrors.videoTextOverlays = t.budget.fieldRequired;
        if (!formData.videoStyle) newErrors.videoStyle = t.budget.fieldRequired;
        if (!formData.videoHasReferences) newErrors.videoHasReferences = t.budget.fieldRequired;
        if (formData.videoHasReferences === "Sim" && !formData.videoReferencesDesc) newErrors.videoReferencesDesc = t.budget.fieldRequired;
      }
      if (formData.needsPlantaHumanizada) {
        if (!formData.plantaQuantity) newErrors.plantaQuantity = t.budget.indicateQuantity;
        if (!formData.plantaTypologies) newErrors.plantaTypologies = t.budget.fieldRequired;
      }
    }

    if (currentStep === 2) {
      if (formData.isAlreadyModeled === null) newErrors.isAlreadyModeled = t.budget.fieldRequired;
      if (formData.isAlreadyModeled === true && !formData.fileFormat) newErrors.fileFormat = t.budget.fieldRequired;
      if (formData.isAlreadyModeled === false && formData.availableMaterial.length === 0) newErrors.availableMaterial = t.budget.selectAtLeastOne;
      if (!formData.materialsDefined) newErrors.materialsDefined = t.budget.fieldRequired;
    }

    setErrors(newErrors);
    
    const hasErrors = Object.keys(newErrors).length > 0;
    
    if (hasErrors) {
      // Scroll to first error
      const firstErrorField = Object.keys(newErrors)[0];
      const element = document.getElementById(`field-${firstErrorField}`);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }

    return !hasErrors;
  };

  const nextStep = () => {
    if (!validateStep()) {
      return;
    }
    setError(null);
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(prev => prev + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const prevStep = () => {
    setError(null);
    setErrors({});
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const formattedEmailBody = useMemo(() => {
    const labels = t.budget.reviewLabels;
    const sections = t.budget.reviewSections;
    const yesNo = (val: boolean) => val ? t.budget.yes : t.budget.no;

    return `
${language === "pt" ? "NOVO PEDIDO DE ORÇAMENTO" : "NEW BUDGET REQUEST"} - BOHRER ARCHVIZ
----------------------------------------

${sections.basic.toUpperCase()}
${labels.client}: ${formData.clientName}
${labels.company}: ${formData.companyName || "N/A"}
${labels.project}: ${formData.projectName}
${labels.email}: ${formData.email}
${labels.phone}: ${formData.phone}
${language === "pt" ? "Localização" : "Location"}: ${formData.location}
${labels.type}: ${formData.projectType}

${sections.services.toUpperCase()}
${labels.external}: ${yesNo(formData.needsExternalImages)}
${formData.needsExternalImages ? `${t.budget.quantity}: ${formData.externalQuantity}\n${t.budget.viewTypes}: ${formData.externalViews.join(", ")}${formData.externalViews.includes("Outro") ? ` (${formData.externalViewsOther || (language === "pt" ? "não especificado" : "not specified")})` : ""}\nMood: ${formData.externalMood}` : ""}

${labels.interior}: ${yesNo(formData.needsInteriorImages)}
${formData.needsInteriorImages ? `${t.budget.quantity}: ${formData.interiorQuantity}\n${t.budget.interiorSpaces}: ${formData.interiorSpaces.join(", ")}${formData.interiorSpaces.includes("Outro") ? ` (${formData.interiorSpacesOther || (language === "pt" ? "não especificado" : "not specified")})` : ""}` : ""}

${labels.video}: ${yesNo(formData.needsVideo)}
${formData.needsVideo ? `
- ${t.budget.videoType}: ${formData.videoType}
- ${t.budget.videoDuration}: ${formData.videoDuration}
- ${t.budget.videoFormat}: ${formData.videoFormat}
- ${t.budget.videoEssential}: ${formData.videoEssential}
- ${t.budget.videoTextOverlays}: ${formData.videoTextOverlays}
- ${t.budget.videoStyle}: ${formData.videoStyle}
- ${t.budget.videoHasReferences}: ${formData.videoHasReferences}
${formData.videoHasReferences === "Sim" ? `- Referências: ${formData.videoReferencesDesc}` : ""}
` : ""}

${t.budget.plantaHumanizada}: ${yesNo(formData.needsPlantaHumanizada)}
${formData.needsPlantaHumanizada ? `
- ${t.budget.plantaQuantity}: ${formData.plantaQuantity}
- ${t.budget.plantaTypologies}: ${formData.plantaTypologies}
` : ""}

${sections.material.toUpperCase()}
${labels.modeled}: ${formData.isAlreadyModeled === true ? `${t.budget.yes} (${formData.fileFormat})` : formData.isAlreadyModeled === false ? `${t.budget.no} (${formData.availableMaterial.join(", ")})` : "N/A"}
${formData.relevantFiles.length > 0 ? `${language === "pt" ? "Arquivos Anexados" : "Attached Files"}: ${formData.relevantFiles.map(f => f.name).join(", ")}\n` : ""}${t.budget.materialsDefined}: ${formData.materialsDefined}
${formData.materialsNotes ? `${language === "pt" ? "Notas Materiais" : "Materials Notes"}: ${formData.materialsNotes}` : ""}

${labels.surroundings}: ${formData.includeSurroundings}
${formData.surroundingsNotes ? `${language === "pt" ? "Notas Entorno" : "Surroundings Notes"}: ${formData.surroundingsNotes}` : ""}
${labels.humanization}: ${formData.includeHumanization}
${formData.humanizationNotes ? `${language === "pt" ? "Notas Humanização" : "Humanization Notes"}: ${formData.humanizationNotes}` : ""}

${sections.delivery.toUpperCase()}
${labels.deadline}: ${formData.deadline}

${t.budget.additionalNotes.toUpperCase()}
${formData.additionalNotes || (language === "pt" ? "Nenhuma observação adicional." : "No additional observations.")}
    `.trim();
  }, [formData, t, language]);

  const generatePDF = () => {
    const doc = new jsPDF();
    const title = language === "pt" ? "Orçamento - BOHRER Archviz" : "Budget Request - BOHRER Archviz";
    const notInformed = t.budget.notInformed;
    
    const getVal = (val: any) => {
      if (val === null || val === undefined || val === "" || (Array.isArray(val) && val.length === 0)) {
        return notInformed;
      }
      if (Array.isArray(val)) return val.join(", ");
      return val;
    };

    const yesNo = (val: boolean) => val ? t.budget.yes : t.budget.no;

    doc.setFontSize(20);
    doc.text(title, 14, 22);
    doc.setFontSize(10);
    doc.text(`Date: ${new Date().toLocaleDateString()}`, 14, 30);

    const sections = [
      {
        title: language === "pt" ? "Cliente e Projeto" : "Client and Project",
        data: [
          [t.budget.reviewLabels.client, getVal(formData.clientName)],
          [t.budget.reviewLabels.company, getVal(formData.companyName)],
          [t.budget.reviewLabels.project, getVal(formData.projectName)],
          [t.budget.reviewLabels.email, getVal(formData.email)],
          [t.budget.reviewLabels.phone, getVal(formData.phone)],
          [t.budget.location, getVal(formData.location)],
          [t.budget.projectType, getVal(formData.projectType)],
        ]
      },
      {
        title: language === "pt" ? "Serviços" : "Services",
        data: [
          [t.budget.externalImages, yesNo(formData.needsExternalImages)],
          [t.budget.interiorImages, yesNo(formData.needsInteriorImages)],
          [t.budget.video, yesNo(formData.needsVideo)],
          [t.budget.plantaHumanizada, yesNo(formData.needsPlantaHumanizada)],
        ]
      }
    ];

    if (formData.needsExternalImages) {
      const views = formData.externalViews.includes("Outro") 
        ? formData.externalViews.map(v => v === "Outro" ? `Outro: ${formData.externalViewsOther || (language === "pt" ? "não especificado" : "not specified")}` : v).join(", ")
        : getVal(formData.externalViews);

      sections.push({
        title: language === "pt" ? "Detalhes das Imagens Externas" : "External Images Details",
        data: [
          [t.budget.quantity, getVal(formData.externalQuantity)],
          [t.budget.viewTypes, views],
          [t.budget.mood, getVal(formData.externalMood)],
        ]
      });
    }

    if (formData.needsInteriorImages) {
      const spaces = formData.interiorSpaces.includes("Outro") 
        ? formData.interiorSpaces.map(s => s === "Outro" ? `Outro: ${formData.interiorSpacesOther || (language === "pt" ? "não especificado" : "not specified")}` : s).join(", ")
        : getVal(formData.interiorSpaces);

      sections.push({
        title: language === "pt" ? "Detalhes das Imagens Interiores" : "Interior Images Details",
        data: [
          [t.budget.quantity, getVal(formData.interiorQuantity)],
          [t.budget.interiorSpaces, spaces],
        ]
      });
    }

    if (formData.needsVideo) {
      sections.push({
        title: language === "pt" ? "Detalhes do Vídeo" : "Video Details",
        data: [
          [t.budget.videoType, getVal(formData.videoType)],
          [t.budget.videoDuration, getVal(formData.videoDuration)],
          [t.budget.videoFormat, getVal(formData.videoFormat)],
          [t.budget.videoEssential, getVal(formData.videoEssential)],
          [t.budget.videoTextOverlays, getVal(formData.videoTextOverlays)],
          [t.budget.videoStyle, getVal(formData.videoStyle)],
          [t.budget.videoHasReferences, getVal(formData.videoHasReferences)],
          [language === "pt" ? "Referências" : "References", getVal(formData.videoReferencesDesc)],
        ]
      });
    }

    if (formData.needsPlantaHumanizada) {
      sections.push({
        title: language === "pt" ? "Detalhes da Planta Humanizada" : "Floor Plan Details",
        data: [
          [t.budget.plantaQuantity, getVal(formData.plantaQuantity)],
          [t.budget.plantaTypologies, getVal(formData.plantaTypologies)],
        ]
      });
    }

    sections.push({
      title: language === "pt" ? "Material Disponível" : "Available Material",
      data: [
        [t.budget.isModeled, formData.isAlreadyModeled === null ? notInformed : yesNo(formData.isAlreadyModeled)],
        [t.budget.fileFormat, getVal(formData.fileFormat)],
        [t.budget.availableMaterial, getVal(formData.availableMaterial)],
      ]
    });

    sections.push({
      title: language === "pt" ? "Materiais e Acabamentos" : "Materials and Finishes",
      data: [
        [t.budget.materialsDefined, getVal(formData.materialsDefined)],
        [t.budget.materialsNotes, getVal(formData.materialsNotes)],
      ]
    });

    sections.push({
      title: language === "pt" ? "Cena e Expectativas" : "Scene and Expectations",
      data: [
        [t.budget.surroundings, getVal(formData.includeSurroundings)],
        [language === "pt" ? "Notas Entorno" : "Surroundings Notes", getVal(formData.surroundingsNotes)],
        [t.budget.humanization, getVal(formData.includeHumanization)],
        [language === "pt" ? "Notas Humanização" : "Humanization Notes", getVal(formData.humanizationNotes)],
      ]
    });

    sections.push({
      title: language === "pt" ? "Prazos" : "Deadlines",
      data: [
        [t.budget.deadline, getVal(formData.deadline)],
      ]
    });

    sections.push({
      title: language === "pt" ? "Observações Finais" : "Final Notes",
      data: [
        [t.budget.additionalNotes, getVal(formData.additionalNotes)],
      ]
    });

    let currentY = 40;
    sections.forEach((section) => {
      if (currentY > 250) {
        doc.addPage();
        currentY = 20;
      }
      autoTable(doc, {
        startY: currentY,
        head: [[{ content: section.title, colSpan: 2, styles: { halign: 'left', fillColor: [40, 40, 40] } }]],
        body: section.data,
        theme: 'striped',
        headStyles: { fontSize: 10, fontStyle: 'bold' },
        bodyStyles: { fontSize: 9 },
        margin: { top: 10 },
      });
      currentY = (doc as any).lastAutoTable.finalY + 10;
    });

    doc.save(`BOHRER_Archviz_Budget_${formData.projectName.replace(/\s+/g, '_')}.pdf`);
    setIsPdfGenerated(true);
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    setIsSubmitting(true);
    setError(null);

    const form = e.currentTarget;
    const formDataObj = new FormData(form);
    
    // Add relevant files to FormData
    formData.relevantFiles.forEach((file) => {
      formDataObj.append("relevantFiles[]", file);
    });
    
    // Add formattedEmailBody
    formDataObj.append("formattedEmailBody", formattedEmailBody);

    try {
      const response = await fetch("/", {
        method: "POST",
        body: formDataObj,
      });

      if (response.ok) {
        setIsSubmitted(true);
      } else {
        throw new Error("Failed to submit form to Netlify");
      }
    } catch (err) {
      console.error(err);
      setError(t.budget.error);
      setShowFallback(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(formattedEmailBody);
    alert(t.budget.copySuccess);
  };

  if (isSubmitted) {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-2xl mx-auto w-full bg-white p-16 rounded-3xl border border-brand-accent/20 shadow-sm text-center"
      >
        <div className="w-20 h-20 bg-green-50 text-green-600 rounded-full flex items-center justify-center mx-auto mb-8">
          <CheckCircle2 className="w-10 h-10" />
        </div>
        <h2 className="text-3xl font-medium mb-6 tracking-tight">{t.budget.successTitle}</h2>
        <p className="text-lg text-brand-muted leading-relaxed mb-8">
          {t.budget.successDesc}
        </p>

        {formData.relevantFiles.length > 0 && (
          <div className="mb-12 space-y-3">
            <p className="text-xs font-bold text-brand-muted uppercase tracking-widest mb-4">Arquivos Anexados:</p>
            <div className="flex flex-col gap-2 max-w-sm mx-auto">
              {formData.relevantFiles.map((file, index) => (
                <div key={index} className="flex items-center gap-3 p-3 bg-brand-offwhite rounded-xl border border-brand-accent/10">
                  <FileIcon className="w-4 h-4 text-brand-dark/40" />
                  <div className="flex-1 text-left min-w-0">
                    <p className="text-xs font-bold text-brand-dark truncate">{file.name}</p>
                    <p className="text-[10px] text-brand-muted uppercase">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <button 
          onClick={() => window.location.reload()}
          className="px-8 py-4 bg-brand-dark text-white rounded-xl font-medium hover:bg-brand-dark/90 transition-all"
        >
          {t.budget.backHome}
        </button>
      </motion.div>
    );
  }

  return (
    <form 
      name="orcamento" 
      method="POST"
      action="/"
      data-netlify="true" 
      data-netlify-honeypot="bot-field"
      encType="multipart/form-data"
      onSubmit={(e) => {
        e.preventDefault();
        if (currentStep === 5) handleSubmit(e);
      }}
      className="max-w-3xl mx-auto w-full"
    >
      <input type="hidden" name="form-name" value="orcamento" />
      <div hidden>
        <label>
          Don't fill this out if you're human: <input name="bot-field" />
        </label>
      </div>
      {/* Progress Bar */}
      <div className="mb-4 md:mb-12">
        <div className="flex justify-between items-center mb-3 md:mb-4 px-2">
          <span className="text-xs font-medium text-brand-muted uppercase tracking-widest">
            {t.budget.stepLabel} {currentStep + 1} {t.budget.of} {STEPS.length}
          </span>
          <span className="text-xs font-medium text-brand-dark uppercase tracking-widest">
            {STEPS[currentStep]}
          </span>
        </div>
        <div className="h-1.5 w-full bg-brand-accent/20 rounded-full overflow-hidden">
          <motion.div 
            className="h-full bg-brand-dark"
            initial={{ width: 0 }}
            animate={{ width: `${((currentStep + 1) / STEPS.length) * 100}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
      </div>

      <div className="bg-white p-5 md:p-12 rounded-3xl border border-brand-accent/20 shadow-sm min-h-[400px] md:min-h-[500px] flex flex-col">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.4 }}
            className="flex-1"
          >
            {currentStep < 5 && (
              <div className="mb-4 md:mb-6">
                <p className="text-[10px] text-brand-muted tracking-wide">
                  * {t.budget.requiredNote}
                </p>
              </div>
            )}

            {currentStep === 0 && (
              <div className="space-y-4 md:space-y-8">
                <SectionTitle title={t.budget.basicInfoTitle} />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-6">
                  <InputField id="field-clientName" name="clientName" label={t.budget.clientName} value={formData.clientName} onChange={v => updateField("clientName", v)} placeholder={t.budget.clientNamePlaceholder} required error={errors.clientName} />
                  <InputField id="field-companyName" name="companyName" label={t.budget.companyName} value={formData.companyName} onChange={v => updateField("companyName", v)} placeholder={t.budget.companyNamePlaceholder} />
                  <InputField id="field-projectName" name="projectName" label={t.budget.projectName} value={formData.projectName} onChange={v => updateField("projectName", v)} placeholder={t.budget.projectNamePlaceholder} required error={errors.projectName} />
                  <InputField id="field-email" name="email" label={t.budget.email} value={formData.email} onChange={v => updateField("email", v)} placeholder={t.budget.emailPlaceholder} type="email" required error={errors.email} />
                  <InputField id="field-phone" name="phone" label={t.budget.phone} value={formData.phone} onChange={v => updateField("phone", v)} placeholder={t.budget.phonePlaceholder} />
                  <InputField id="field-location" name="location" label={t.budget.location} value={formData.location} onChange={v => updateField("location", v)} placeholder={t.budget.locationPlaceholder} />
                </div>
                <div id="field-projectType" className="space-y-4">
                  <p className="text-[10px] md:text-[11px] font-bold text-brand-muted uppercase tracking-[0.2em]">{t.budget.projectType} *</p>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {t.budget.projectTypes.map(type => (
                      <SelectButton 
                        key={type} 
                        label={type} 
                        selected={formData.projectType === type} 
                        onClick={() => updateField("projectType", type)} 
                        error={!!errors.projectType}
                      />
                    ))}
                  </div>
                  {errors.projectType && <p className="text-xs text-red-500 mt-1">{errors.projectType}</p>}
                </div>
              </div>
            )}

            {currentStep === 1 && (
              <div className="space-y-4 md:space-y-12">
                <SectionTitle title={t.budget.servicesTitle} />
                
                {/* External Images */}
                <div className="space-y-2 md:space-y-6">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 md:gap-4">
                    <p className="text-base md:text-lg font-medium text-brand-dark">{t.budget.externalImages}</p>
                    <YesNoToggle value={formData.needsExternalImages} onChange={v => updateField("needsExternalImages", v)} />
                  </div>
                  {formData.needsExternalImages && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="space-y-4 md:space-y-6 pt-3 md:pt-4 border-t border-brand-accent/10">
                      <InputField id="field-externalQuantity" name="externalQuantity" label={t.budget.quantity} value={formData.externalQuantity} onChange={v => updateField("externalQuantity", v)} placeholder={t.budget.quantityPlaceholder} required error={errors.externalQuantity} />
                      <div id="field-externalViews" className="space-y-3 md:space-y-4">
                        <p className="text-[10px] md:text-[11px] font-bold text-brand-muted uppercase tracking-[0.2em]">{t.budget.viewTypes} *</p>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2 md:gap-3">
                          {t.budget.views.map(view => (
                            <MultiSelectButton 
                              key={view} 
                              label={view} 
                              selected={formData.externalViews.includes(view)} 
                              onClick={() => toggleList("externalViews", view)} 
                              error={!!errors.externalViews}
                            />
                          ))}
                        </div>
                        {errors.externalViews && <p className="text-xs text-red-500 mt-1">{errors.externalViews}</p>}
                        
                        {formData.externalViews.includes("Outro") && (
                          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="pt-2">
                            <InputField 
                              label={language === "pt" ? "Outras Vistas" : "Other Views"}
                              value={formData.externalViewsOther} 
                              onChange={v => updateField("externalViewsOther", v)} 
                              placeholder={t.budget.otherViewsPlaceholder} 
                            />
                          </motion.div>
                        )}
                      </div>
                      <InputField id="field-externalMood" name="externalMood" label={t.budget.mood} value={formData.externalMood} onChange={v => updateField("externalMood", v)} placeholder={t.budget.moodPlaceholder} />
                    </motion.div>
                  )}
                </div>

                {/* Interior Images */}
                <div className="space-y-2 md:space-y-6 border-t border-brand-accent/20 pt-4 md:pt-8">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 md:gap-4">
                    <p className="text-base md:text-lg font-medium text-brand-dark">{t.budget.interiorImages}</p>
                    <YesNoToggle value={formData.needsInteriorImages} onChange={v => updateField("needsInteriorImages", v)} />
                  </div>
                  {formData.needsInteriorImages && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="space-y-4 md:space-y-6 pt-3 md:pt-4 border-t border-brand-accent/10">
                      <InputField id="field-interiorQuantity" name="interiorQuantity" label={t.budget.quantity} value={formData.interiorQuantity} onChange={v => updateField("interiorQuantity", v)} placeholder={t.budget.quantityPlaceholder} required error={errors.interiorQuantity} />
                      <div id="field-interiorSpaces" className="space-y-3 md:space-y-4">
                        <p className="text-[10px] md:text-[11px] font-bold text-brand-muted uppercase tracking-[0.2em]">{t.budget.interiorSpaces} *</p>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2 md:gap-3">
                          {t.budget.spaces.map(space => (
                            <MultiSelectButton 
                              key={space} 
                              label={space} 
                              selected={formData.interiorSpaces.includes(space)} 
                              onClick={() => toggleList("interiorSpaces", space)} 
                              error={!!errors.interiorSpaces}
                            />
                          ))}
                        </div>
                        {errors.interiorSpaces && <p className="text-xs text-red-500 mt-1">{errors.interiorSpaces}</p>}
                        
                        {formData.interiorSpaces.includes("Outro") && (
                          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="pt-2">
                            <InputField 
                              label={language === "pt" ? "Outros Ambientes" : "Other Spaces"}
                              value={formData.interiorSpacesOther} 
                              onChange={v => updateField("interiorSpacesOther", v)} 
                              placeholder={t.budget.otherSpacesPlaceholder} 
                            />
                          </motion.div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </div>

                {/* Video */}
                <div className="space-y-2 md:space-y-6 border-t border-brand-accent/20 pt-4 md:pt-8">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 md:gap-4">
                    <p className="text-base md:text-lg font-medium text-brand-dark">{t.budget.video}</p>
                    <YesNoToggle value={formData.needsVideo} onChange={v => updateField("needsVideo", v)} />
                  </div>
                  {formData.needsVideo && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="space-y-4 md:space-y-6 pt-3 md:pt-4 border-t border-brand-accent/10">
                      <div id="field-videoType" className="space-y-3 md:space-y-4">
                        <p className="text-[10px] md:text-[11px] font-bold text-brand-muted uppercase tracking-[0.2em]">{t.budget.videoType} *</p>
                        <div className="flex gap-3 md:gap-4">
                          {t.budget.videoTypes.map(type => (
                            <SelectButton 
                              key={type} 
                              label={type} 
                              selected={formData.videoType === type} 
                              onClick={() => updateField("videoType", type)} 
                              error={!!errors.videoType}
                            />
                          ))}
                        </div>
                        {errors.videoType && <p className="text-xs text-red-500 mt-1">{errors.videoType}</p>}
                      </div>
                      <InputField id="field-videoDuration" name="videoDuration" label={t.budget.videoDuration} value={formData.videoDuration} onChange={v => updateField("videoDuration", v)} placeholder={t.budget.videoDurationPlaceholder} />
                      
                      <div id="field-videoFormat" className="space-y-3 md:space-y-4">
                        <p className="text-[10px] md:text-[11px] font-bold text-brand-muted uppercase tracking-[0.2em]">{t.budget.videoFormat} *</p>
                        <div className="flex gap-3 md:gap-4">
                          {t.budget.videoFormats.map(fmt => (
                            <SelectButton 
                              key={fmt} 
                              label={fmt} 
                              selected={formData.videoFormat === fmt} 
                              onClick={() => updateField("videoFormat", fmt)} 
                              error={!!errors.videoFormat}
                            />
                          ))}
                        </div>
                        {errors.videoFormat && <p className="text-xs text-red-500 mt-1">{errors.videoFormat}</p>}
                      </div>

                      <TextArea id="field-videoEssential" name="videoEssential" label={t.budget.videoEssential} value={formData.videoEssential} onChange={v => updateField("videoEssential", v)} placeholder={t.budget.videoEssentialPlaceholder} required error={errors.videoEssential} />
                      
                      <div id="field-videoTextOverlays" className="space-y-3 md:space-y-4">
                        <p className="text-[10px] md:text-[11px] font-bold text-brand-muted uppercase tracking-[0.2em]">{t.budget.videoTextOverlays} *</p>
                        <div className="flex gap-3 md:gap-4">
                          {[t.budget.yes, t.budget.no].map(opt => (
                            <SelectButton 
                              key={opt} 
                              label={opt} 
                              selected={formData.videoTextOverlays === opt} 
                              onClick={() => updateField("videoTextOverlays", opt)} 
                              error={!!errors.videoTextOverlays}
                            />
                          ))}
                        </div>
                        {errors.videoTextOverlays && <p className="text-xs text-red-500 mt-1">{errors.videoTextOverlays}</p>}
                      </div>

                      <div id="field-videoStyle" className="space-y-3 md:space-y-4">
                        <p className="text-[10px] md:text-[11px] font-bold text-brand-muted uppercase tracking-[0.2em]">{t.budget.videoStyle} *</p>
                        <div className="flex gap-3 md:gap-4">
                          {t.budget.videoStyles.map(style => (
                            <SelectButton 
                              key={style} 
                              label={style} 
                              selected={formData.videoStyle === style} 
                              onClick={() => updateField("videoStyle", style)} 
                              error={!!errors.videoStyle}
                            />
                          ))}
                        </div>
                        {errors.videoStyle && <p className="text-xs text-red-500 mt-1">{errors.videoStyle}</p>}
                      </div>

                      <div id="field-videoHasReferences" className="space-y-3 md:space-y-4">
                        <p className="text-[10px] md:text-[11px] font-bold text-brand-muted uppercase tracking-[0.2em]">{t.budget.videoHasReferences} *</p>
                        <div className="flex gap-3 md:gap-4">
                          {[t.budget.yes, t.budget.no].map(opt => (
                            <SelectButton 
                              key={opt} 
                              label={opt} 
                              selected={formData.videoHasReferences === opt} 
                              onClick={() => updateField("videoHasReferences", opt)} 
                              error={!!errors.videoHasReferences}
                            />
                          ))}
                        </div>
                        {errors.videoHasReferences && <p className="text-xs text-red-500 mt-1">{errors.videoHasReferences}</p>}
                      </div>

                      {formData.videoHasReferences === "Sim" && (
                        <TextArea 
                          id="field-videoReferencesDesc"
                          name="videoReferencesDesc"
                          label={language === "pt" ? "Referências" : "References"} 
                          value={formData.videoReferencesDesc} 
                          onChange={v => updateField("videoReferencesDesc", v)} 
                          placeholder={t.budget.videoReferencesPlaceholder} 
                          required
                          error={errors.videoReferencesDesc}
                        />
                      )}
                    </motion.div>
                  )}
                </div>

                {/* Planta Humanizada */}
                <div className="space-y-2 md:space-y-6 border-t border-brand-accent/20 pt-4 md:pt-8">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 md:gap-4">
                    <p className="text-base md:text-lg font-medium text-brand-dark">{t.budget.plantaHumanizada}</p>
                    <YesNoToggle value={formData.needsPlantaHumanizada} onChange={v => updateField("needsPlantaHumanizada", v)} />
                  </div>
                  {formData.needsPlantaHumanizada && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="space-y-4 md:space-y-6 pt-3 md:pt-4 border-t border-brand-accent/10">
                      <InputField id="field-plantaQuantity" name="plantaQuantity" label={t.budget.plantaQuantity} value={formData.plantaQuantity} onChange={v => updateField("plantaQuantity", v)} placeholder="Ex: 2" required error={errors.plantaQuantity} />
                      <TextArea id="field-plantaTypologies" name="plantaTypologies" label={t.budget.plantaTypologies} value={formData.plantaTypologies} onChange={v => updateField("plantaTypologies", v)} placeholder={t.budget.plantaTypologiesPlaceholder} required error={errors.plantaTypologies} />
                    </motion.div>
                  )}
                </div>
              </div>
            )}

            {currentStep === 2 && (
              <div className="space-y-4 md:space-y-12">
                <SectionTitle title={t.budget.materialTitle} />
                
                <div id="field-isAlreadyModeled" className="space-y-2 md:space-y-6">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 md:gap-4">
                    <p className="text-base md:text-lg font-medium text-brand-dark">{t.budget.isModeled}<span className="whitespace-nowrap">&nbsp;*</span></p>
                    <div className={cn("flex bg-brand-offwhite p-1 rounded-xl border transition-all w-fit", errors.isAlreadyModeled ? "border-red-300" : "border-brand-accent/10")}>
                      <button 
                        onClick={() => updateField("isAlreadyModeled", true)}
                        type="button"
                        className={cn("px-6 py-2 rounded-lg text-xs font-bold transition-all", formData.isAlreadyModeled === true ? "bg-white text-brand-dark shadow-sm" : "text-brand-muted")}
                      >
                        {t.budget.yes}
                      </button>
                      <button 
                        onClick={() => updateField("isAlreadyModeled", false)}
                        type="button"
                        className={cn("px-6 py-2 rounded-lg text-xs font-bold transition-all", formData.isAlreadyModeled === false ? "bg-white text-brand-dark shadow-sm" : "text-brand-muted")}
                      >
                        {t.budget.no}
                      </button>
                    </div>
                  </div>
                  {errors.isAlreadyModeled && <p className="text-xs text-red-500 mt-1">{errors.isAlreadyModeled}</p>}
                  
                  {formData.isAlreadyModeled === true && (
                    <motion.div id="field-fileFormat" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3 pt-3 md:pt-4 border-t border-brand-accent/10">
                      <p className="text-[10px] md:text-[11px] font-bold text-brand-muted uppercase tracking-[0.2em]">{t.budget.fileFormat} *</p>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-3">
                        {t.budget.formats.map(format => (
                          <SelectButton 
                            key={format} 
                            label={format} 
                            selected={formData.fileFormat === format} 
                            onClick={() => updateField("fileFormat", format)} 
                            error={!!errors.fileFormat}
                          />
                        ))}
                      </div>
                      {errors.fileFormat && <p className="text-xs text-red-500 mt-1">{errors.fileFormat}</p>}
                    </motion.div>
                  )}
                  
                  {formData.isAlreadyModeled === false && (
                    <motion.div id="field-availableMaterial" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3 pt-3 md:pt-4 border-t border-brand-accent/10">
                      <p className="text-[10px] md:text-[11px] font-bold text-brand-muted uppercase tracking-[0.2em]">{t.budget.availableMaterial} *</p>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-2 md:gap-3">
                        {t.budget.materials.map(mat => (
                          <MultiSelectButton 
                            key={mat} 
                            label={mat} 
                            selected={formData.availableMaterial.includes(mat)} 
                            onClick={() => toggleList("availableMaterial", mat)} 
                            error={!!errors.availableMaterial}
                          />
                        ))}
                      </div>
                      {errors.availableMaterial && <p className="text-xs text-red-500 mt-1">{errors.availableMaterial}</p>}
                    </motion.div>
                  )}
                </div>

                <div id="field-materialsDefined" className="space-y-2 md:space-y-6 border-t border-brand-accent/20 pt-4 md:pt-8">
                  <p className="text-base md:text-lg font-medium text-brand-dark">{t.budget.materialsDefined} *</p>
                  <div className="flex gap-3 md:gap-4">
                    {t.budget.materialsOptions.map(opt => (
                      <SelectButton 
                        key={opt} 
                        label={opt} 
                        selected={formData.materialsDefined === opt} 
                        onClick={() => updateField("materialsDefined", opt)} 
                        error={!!errors.materialsDefined}
                      />
                    ))}
                  </div>
                  {errors.materialsDefined && <p className="text-xs text-red-500 mt-1">{errors.materialsDefined}</p>}
                  
                  {formData.materialsDefined && (
                    <div className="p-3 md:p-4 bg-brand-offwhite rounded-xl border border-brand-accent/10">
                      <p className="text-sm text-brand-dark font-medium leading-relaxed">
                        {(formData.materialsDefined === "Sim" || formData.materialsDefined === "Yes" || formData.materialsDefined === "Parcialmente" || formData.materialsDefined === "Partially") 
                          ? t.budget.materialsGuidanceYes 
                          : t.budget.materialsGuidanceNo}
                      </p>
                    </div>
                  )}

                  {(formData.materialsDefined === "Parcialmente" || formData.materialsDefined === "Partially" || formData.materialsDefined === "Não" || formData.materialsDefined === "No") && (
                    <TextArea 
                      name="materialsNotes"
                      label={t.budget.materialsNotes} 
                      value={formData.materialsNotes} 
                      onChange={v => updateField("materialsNotes", v)} 
                      placeholder={t.budget.materialsNotesPlaceholder} 
                    />
                  )}
                </div>
              </div>
            )}

            {currentStep === 3 && (
              <div className="space-y-4 md:space-y-12">
                <SectionTitle title={t.budget.sceneTitle} />
                
                <div className="space-y-2 md:space-y-6">
                  <p className="text-base md:text-lg font-medium text-brand-dark">{t.budget.surroundings}</p>
                  <div className="flex gap-3 md:gap-4">
                    {t.budget.surroundingsOptions.map(opt => (
                      <SelectButton 
                        key={opt} 
                        label={opt} 
                        selected={formData.includeSurroundings === opt} 
                        onClick={() => updateField("includeSurroundings", opt)} 
                      />
                    ))}
                  </div>
                  {(formData.includeSurroundings === "Sim" || formData.includeSurroundings === "Yes" || formData.includeSurroundings === "Parcialmente" || formData.includeSurroundings === "Partially") && (
                    <TextArea 
                      name="surroundingsNotes"
                      label={t.budget.surroundingsNotes} 
                      value={formData.surroundingsNotes} 
                      onChange={v => updateField("surroundingsNotes", v)} 
                      placeholder={t.budget.surroundingsNotesPlaceholder} 
                    />
                  )}
                </div>

                <div className="space-y-2 md:space-y-6 border-t border-brand-accent/20 pt-4 md:pt-8">
                  <p className="text-base md:text-lg font-medium text-brand-dark">{t.budget.humanization}</p>
                  <div className="flex gap-3 md:gap-4">
                    {t.budget.humanizationOptions.map(opt => (
                      <SelectButton 
                        key={opt} 
                        label={opt} 
                        selected={formData.includeHumanization === opt} 
                        onClick={() => updateField("includeHumanization", opt)} 
                      />
                    ))}
                  </div>
                  <TextArea 
                    name="humanizationNotes"
                    label={t.budget.humanizationNotes} 
                    value={formData.humanizationNotes} 
                    onChange={v => updateField("humanizationNotes", v)} 
                    placeholder={t.budget.humanizationNotesPlaceholder} 
                  />
                </div>
              </div>
            )}

            {currentStep === 4 && (
              <div className="space-y-4 md:space-y-12">
                <SectionTitle title={t.budget.deliveryTitle} />
                
                <div className="space-y-3 md:space-y-8">
                  <InputField name="deadline" label={t.budget.deadline} value={formData.deadline} onChange={v => updateField("deadline", v)} placeholder={t.budget.deadlinePlaceholder} />
                  
                  <TextArea name="additionalNotes" label={t.budget.additionalNotes} value={formData.additionalNotes} onChange={v => updateField("additionalNotes", v)} placeholder={t.budget.additionalNotesPlaceholder} rows={6} />
                  
                  <FileUpload 
                    label="Anexar documentos relevantes (PDF, DWG, referências, etc.)" 
                    name="relevantFiles"
                    files={formData.relevantFiles} 
                    onFilesChange={(files) => updateField("relevantFiles", files)} 
                  />
                </div>
              </div>
            )}

            {currentStep === 5 && (
              <div className="space-y-4 md:space-y-8">
                <SectionTitle title={t.budget.reviewTitle} />
                <div className="space-y-4 md:space-y-6 max-h-[400px] md:max-h-[500px] overflow-y-auto pr-4 custom-scrollbar">
                  <ReviewSection title={t.budget.reviewSections.basic}>
                    <ReviewItem label={t.budget.reviewLabels.client} value={formData.clientName} />
                    <ReviewItem label={t.budget.reviewLabels.company} value={formData.companyName} />
                    <ReviewItem label={t.budget.reviewLabels.project} value={formData.projectName} />
                    <ReviewItem label={t.budget.reviewLabels.email} value={formData.email} />
                    <ReviewItem label={t.budget.reviewLabels.phone} value={formData.phone} />
                    <ReviewItem label={t.budget.reviewLabels.type} value={formData.projectType} />
                  </ReviewSection>

                  <ReviewSection title={t.budget.reviewSections.services}>
                    {formData.needsExternalImages && (
                      <ReviewItem label={t.budget.reviewLabels.external} value={`${formData.externalQuantity} - ${formData.externalViews.join(", ")}`} />
                    )}
                    {formData.needsInteriorImages && (
                      <ReviewItem label={t.budget.reviewLabels.interior} value={`${formData.interiorQuantity} - ${formData.interiorSpaces.join(", ")}`} />
                    )}
                    {formData.needsVideo && (
                      <ReviewItem label={t.budget.reviewLabels.video} value={`${formData.videoType} - ${formData.videoDuration} (${formData.videoFormat})`} />
                    )}
                    {formData.needsPlantaHumanizada && (
                      <ReviewItem label={t.budget.plantaHumanizada} value={`${formData.plantaQuantity} - ${formData.plantaTypologies}`} />
                    )}
                  </ReviewSection>

                  <ReviewSection title={t.budget.reviewSections.material}>
                    <ReviewItem label={t.budget.reviewLabels.modeled} value={formData.isAlreadyModeled === true ? `${t.budget.yes} (${formData.fileFormat})` : formData.isAlreadyModeled === false ? `${t.budget.no} (${formData.availableMaterial.join(", ")})` : "N/A"} />
                    <ReviewItem label={t.budget.reviewLabels.surroundings} value={formData.includeSurroundings} />
                    <ReviewItem label={t.budget.reviewLabels.humanization} value={formData.includeHumanization} />
                  </ReviewSection>

                  <ReviewSection title={t.budget.reviewSections.delivery}>
                    <ReviewItem label={t.budget.reviewLabels.deadline} value={formData.deadline} />
                  </ReviewSection>
                </div>

                <AnimatePresence>
                  {isPdfGenerated && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-6 bg-brand-offwhite rounded-2xl border border-brand-accent/20 text-center space-y-6"
                    >
                      <div className="flex items-center justify-center gap-2 text-green-600 mb-2">
                        <CheckCircle2 className="w-5 h-5" />
                        <span className="text-sm font-bold uppercase tracking-widest">{t.budget.pdfGeneratedTitle}</span>
                      </div>
                      <p className="text-brand-dark font-medium leading-relaxed">
                        {t.budget.pdfGeneratedMessage}
                      </p>
                      <div className="flex flex-wrap justify-center gap-4 pt-2">
                        <a 
                          href="https://wa.me/+351964684343" 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 px-6 py-3 bg-[#25D366] text-white rounded-xl font-medium hover:opacity-90 transition-all shadow-sm"
                        >
                          <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                          </svg>
                          {t.budget.whatsapp}
                        </a>
                        <a 
                          href="mailto:bohrer.archviz@gmail.com" 
                          className="flex items-center gap-2 px-6 py-3 bg-brand-dark text-white rounded-xl font-medium hover:bg-brand-dark/90 transition-all shadow-sm"
                        >
                          <Send className="w-4 h-4" />
                          {t.budget.emailLabel}
                        </a>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {error && (
                  <div className="p-4 bg-red-50 border border-red-100 rounded-xl flex items-start gap-3 text-red-600 text-sm">
                    <AlertCircle className="w-5 h-5 shrink-0" />
                    <p>{error}</p>
                  </div>
                )}

                {showFallback && (
                  <div className="space-y-4">
                    <p className="text-sm font-medium text-brand-muted uppercase tracking-widest">{t.budget.manualCopy}</p>
                    <div className="relative">
                      <textarea 
                        readOnly 
                        value={formattedEmailBody} 
                        className="w-full h-48 p-4 bg-brand-offwhite border border-brand-accent/30 rounded-xl text-xs font-mono leading-relaxed resize-none"
                      />
                      <button 
                        onClick={copyToClipboard}
                        className="absolute top-3 right-3 p-2 bg-white border border-brand-accent/30 rounded-lg hover:bg-brand-dark hover:text-white transition-all shadow-sm"
                        title={t.budget.manualCopy}
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                    </div>
                    <p className="text-xs text-brand-muted text-center italic">
                      {t.budget.manualCopyDesc} <strong>bohrer.archviz@gmail.com</strong>
                    </p>
                  </div>
                )}
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Navigation Buttons */}
        <div className="mt-8 md:mt-12 flex flex-col md:flex-row items-center justify-between gap-4 pt-6 md:pt-8 border-t border-brand-accent/20">
          <button
            onClick={prevStep}
            type="button"
            disabled={isSubmitting}
            className={cn(
              "flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-medium transition-all w-full md:w-auto justify-center",
              currentStep === 0 ? "hidden" : "bg-brand-accent/20 text-brand-dark hover:bg-brand-accent/30 border border-brand-accent/10 shadow-sm"
            )}
          >
            <ChevronLeft className="w-4 h-4" /> {t.budget.prev}
          </button>

          {currentStep === STEPS.length - 1 ? (
            <div className="flex flex-col md:flex-row gap-3 md:gap-4 w-full md:w-auto">
              <button
                onClick={generatePDF}
                type="button"
                className="flex items-center justify-center gap-2 px-6 md:px-8 py-3.5 md:py-4 bg-brand-offwhite text-brand-dark rounded-xl font-bold transition-all border border-brand-accent/30 hover:shadow-md text-sm md:text-base"
              >
                {t.budget.generatePDF} <FileText className="w-4 h-4" />
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex items-center justify-center gap-2 px-8 md:px-12 py-3.5 md:py-4 bg-brand-dark text-white rounded-xl font-bold hover:bg-brand-dark/90 transition-all shadow-xl shadow-brand-dark/10 disabled:opacity-50 text-sm md:text-base"
              >
                {isSubmitting ? t.budget.submitting : (
                  <>
                    {t.budget.submit} <Send className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          ) : (
            <button
              onClick={nextStep}
              type="button"
              className="flex items-center justify-center gap-2 px-8 md:px-12 py-3.5 md:py-4 bg-brand-dark text-white rounded-xl font-bold hover:bg-brand-dark/90 transition-all shadow-xl shadow-brand-dark/10 w-full md:w-auto text-sm md:text-base"
            >
              {t.budget.next} <ChevronRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </form>
  );
}

// Helper Components
function SectionTitle({ title }: { title: string }) {
  return <h3 className="text-xl md:text-3xl font-bold tracking-tight mb-4 md:mb-10 text-brand-dark">{title}</h3>;
}

function InputField({ id, name, label, value, onChange, placeholder, type = "text", required = false, error }: { id?: string, name?: string, label: string, value: string, onChange: (v: string) => void, placeholder: string, type?: string, required?: boolean, error?: string }) {
  return (
    <div id={id} className="space-y-1 md:space-y-3">
      <label className="text-[10px] md:text-[11px] font-bold text-brand-muted uppercase tracking-[0.2em]">{label} {required && "*"}</label>
      <input 
        type={type}
        name={name}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className={cn(
          "w-full px-5 py-4 bg-brand-offwhite border transition-all outline-none text-brand-dark placeholder:text-brand-muted/50 placeholder:text-[13px] md:placeholder:text-sm rounded-xl",
          error ? "border-red-300 bg-red-50/30" : "border-transparent focus:bg-white focus:border-brand-dark/20"
        )}
      />
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  );
}

function TextArea({ id, name, label, value, onChange, placeholder, rows = 3, required = false, error }: { id?: string, name?: string, label: string, value: string, onChange: (v: string) => void, placeholder: string, rows?: number, required?: boolean, error?: string }) {
  return (
    <div id={id} className="space-y-1 md:space-y-3">
      <label className="text-[10px] md:text-[11px] font-bold text-brand-muted uppercase tracking-[0.2em]">{label} {required && "*"}</label>
      <textarea 
        name={name}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        rows={rows}
        className={cn(
          "w-full px-5 py-4 bg-brand-offwhite border transition-all outline-none text-brand-dark placeholder:text-brand-muted/50 placeholder:text-[13px] md:placeholder:text-sm resize-none rounded-xl",
          error ? "border-red-300 bg-red-50/30" : "border-transparent focus:bg-white focus:border-brand-dark/20"
        )}
      />
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  );
}

function SelectButton({ label, selected, onClick, error }: { label: string, selected: boolean, onClick: () => void, error?: boolean, key?: string | number }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex-1 px-4 py-3 rounded-xl text-[11px] md:text-sm font-bold transition-all border",
        selected 
          ? "bg-brand-dark text-white border-brand-dark shadow-md" 
          : cn("bg-brand-offwhite text-brand-muted hover:border-brand-accent/50", error ? "border-red-200" : "border-transparent")
      )}
    >
      {label}
    </button>
  );
}

function MultiSelectButton({ label, selected, onClick, error }: { label: string, selected: boolean, onClick: () => void, error?: boolean, key?: string | number }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex items-center justify-between px-4 py-3 rounded-xl text-[10px] md:text-[11px] font-bold transition-all border",
        selected 
          ? "bg-brand-dark text-white border-brand-dark shadow-sm" 
          : cn("bg-brand-offwhite text-brand-muted hover:border-brand-accent/50", error ? "border-red-200" : "border-transparent")
      )}
    >
      {label}
      {selected ? <Check className="w-3 h-3 ml-2" /> : <Plus className="w-3 h-3 ml-2 opacity-30" />}
    </button>
  );
}

function YesNoToggle({ value, onChange }: { value: boolean, onChange: (v: boolean) => void }) {
  const { t } = useLanguage();
  return (
    <div className="flex bg-brand-offwhite p-1 rounded-xl border border-brand-accent/10">
      <button 
        onClick={() => onChange(true)}
        type="button"
        className={cn("px-6 py-2 rounded-lg text-xs font-bold transition-all", value ? "bg-white text-brand-dark shadow-sm" : "text-brand-muted")}
      >
        {t.budget.yes}
      </button>
      <button 
        onClick={() => onChange(false)}
        type="button"
        className={cn("px-6 py-2 rounded-lg text-xs font-bold transition-all", !value ? "bg-white text-brand-dark shadow-sm" : "text-brand-muted")}
      >
        {t.budget.no}
      </button>
    </div>
  );
}

function ReviewSection({ title, children }: { title: string, children: ReactNode }) {
  return (
    <div className="space-y-4">
      <h4 className="text-[11px] font-bold text-brand-dark uppercase tracking-[0.25em] border-b border-brand-accent/20 pb-2">{title}</h4>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3">
        {children}
      </div>
    </div>
  );
}

function ReviewItem({ label, value }: { label: string, value: string | undefined }) {
  if (!value || value === "" || value === "N/A") return null;
  return (
    <div className="flex justify-between items-baseline gap-4">
      <span className="text-[11px] text-brand-muted uppercase tracking-[0.2em] font-bold whitespace-nowrap">{label}</span>
      <span className="text-sm font-medium text-brand-dark text-right">{value}</span>
    </div>
  );
}

function FileUpload({ 
  label, 
  name,
  files, 
  onFilesChange, 
  accept = ".pdf,.dwg,.jpg,.jpeg,.png" 
}: { 
  label: string, 
  name: string,
  files: File[], 
  onFilesChange: (files: File[]) => void,
  accept?: string
}) {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const processFiles = (newFiles: FileList | null) => {
    if (!newFiles) return;
    
    const validFiles: File[] = [];
    let hasLargeFile = false;

    Array.from(newFiles).forEach(file => {
      if (file.size <= 10 * 1024 * 1024) {
        validFiles.push(file);
      } else {
        hasLargeFile = true;
      }
    });

    if (hasLargeFile) {
      setError("Alguns arquivos são muito grandes. Limite de 10MB por arquivo.");
    } else {
      setError(null);
    }

    if (validFiles.length > 0) {
      onFilesChange([...files, ...validFiles]);
    }
  };

  const handleDrop = (e: DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    processFiles(e.dataTransfer.files);
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    processFiles(e.target.files);
  };

  const removeFile = (index: number) => {
    const newFiles = [...files];
    newFiles.splice(index, 1);
    onFilesChange(newFiles);
  };

  return (
    <div className="space-y-4">
      <label className="text-[10px] md:text-[11px] font-bold text-brand-muted uppercase tracking-[0.2em] leading-relaxed block">{label}</label>
      <div 
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={cn(
          "relative group cursor-pointer border-2 border-dashed rounded-2xl p-10 transition-all duration-300 text-center",
          "bg-white/5 backdrop-blur-sm",
          isDragging 
            ? "border-brand-dark bg-brand-dark/5 scale-[1.01]" 
            : "border-brand-accent/30 hover:border-brand-dark/40 hover:bg-brand-dark/[0.02]",
          error && "border-red-500/50 bg-red-500/[0.02]"
        )}
      >
        <input 
          type="file" 
          name={name}
          ref={fileInputRef}
          onChange={handleFileChange}
          accept={accept}
          multiple
          className="hidden"
        />
        
        <div className="flex flex-col items-center gap-4">
          <div className={cn(
            "w-14 h-14 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300",
            error ? "bg-red-50 text-red-500" : "bg-brand-offwhite text-brand-dark/40"
          )}>
            <Upload className="w-7 h-7" />
          </div>
          <div className="space-y-1">
            <p className="text-sm font-bold text-brand-dark">Clique ou arraste para anexar documentos</p>
            <p className="text-[10px] text-brand-muted uppercase tracking-wider">PDF, DWG, Imagens (Máx 10MB por arquivo)</p>
          </div>
        </div>
      </div>

      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}

      {files.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
          {files.map((file, index) => (
            <div key={index} className="flex items-center gap-3 p-3 bg-brand-offwhite rounded-xl border border-brand-accent/10 group/file">
              <FileIcon className="w-4 h-4 text-brand-dark/40" />
              <div className="flex-1 text-left min-w-0">
                <p className="text-xs font-bold text-brand-dark truncate">{file.name}</p>
                <p className="text-[10px] text-brand-muted uppercase">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
              </div>
              <button 
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  removeFile(index);
                }}
                className="p-1.5 text-brand-muted hover:text-red-500 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
