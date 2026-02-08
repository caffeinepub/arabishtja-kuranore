import { useState } from 'react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { Edit, Save, X } from 'lucide-react';
import { toast } from 'sonner';
import RichTextEditor from './RichTextEditor';
import { renderLessonContent } from '../utils/lessonContentHtml';

interface LessonContentAccordionProps {
  content: string;
  canEdit?: boolean;
  onSave?: (newContent: string) => Promise<void>;
  isSaving?: boolean;
}

export default function LessonContentAccordion({ 
  content, 
  canEdit = false, 
  onSave,
  isSaving = false 
}: LessonContentAccordionProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(content);

  const handleEdit = () => {
    setEditedContent(content);
    setIsEditing(true);
  };

  const handleCancel = () => {
    setEditedContent(content);
    setIsEditing(false);
  };

  const handleSave = async () => {
    if (!onSave) return;
    
    try {
      await onSave(editedContent);
      setIsEditing(false);
      toast.success('Përmbajtja u përditësua me sukses!');
    } catch (error: any) {
      console.error('Error saving content:', error);
      toast.error(error.message || 'Gabim gjatë ruajtjes së përmbajtjes');
      // Keep editor open on error so user can retry or copy content
    }
  };

  const renderedContent = renderLessonContent(content);

  return (
    <Accordion type="single" collapsible className="w-full" defaultValue="content">
      <AccordionItem value="content" className="border rounded-lg bg-card shadow-sm">
        <AccordionTrigger className="px-6 py-4 hover:no-underline">
          <div className="flex items-center justify-between w-full pr-4">
            <h3 className="text-lg font-semibold text-foreground">Përmbajtja</h3>
            {canEdit && !isEditing && (
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  handleEdit();
                }}
                className="gap-2"
              >
                <Edit className="w-4 h-4" />
                Ndrysho
              </Button>
            )}
          </div>
        </AccordionTrigger>
        <AccordionContent className="px-6 pb-4">
          {isEditing ? (
            <div className="space-y-4">
              <RichTextEditor
                value={editedContent}
                onChange={setEditedContent}
                placeholder="Shkruani përmbajtjen e mësimit..."
                className="min-h-[300px]"
              />
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={handleCancel}
                  disabled={isSaving}
                >
                  <X className="w-4 h-4 mr-2" />
                  Anulo
                </Button>
                <Button
                  onClick={handleSave}
                  disabled={isSaving}
                >
                  {isSaving ? (
                    <>
                      <div className="w-4 h-4 mr-2 animate-spin rounded-full border-2 border-background border-t-transparent" />
                      Duke ruajtur...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Ruaj
                    </>
                  )}
                </Button>
              </div>
            </div>
          ) : (
            <div 
              className="prose prose-sm max-w-none dark:prose-invert"
              dangerouslySetInnerHTML={{ __html: renderedContent }}
            />
          )}
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
