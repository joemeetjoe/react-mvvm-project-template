import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/shared/ui/card';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Label } from '@/shared/ui/label';
import { Separator } from '@/shared/ui/separator';
import { Pencil } from 'lucide-react';

interface FieldData {
  id: string;
  label: string;
  value: string;
  editable: boolean;
}

interface InfoSection {
  title: string;
  fields: FieldData[];
}

interface InfoFieldProps {
  label: string;
  value: string;
  id: string;
  isEditing: boolean;
  onChange?: (value: string) => void;
}

interface InfoSectionProps {
  title: string;
  fields: FieldData[];
  isEditing: boolean;
  onInputChange: (field: string, value: string) => void;
}

export interface AppInfoCardProps {
  title: string;
  sections: InfoSection[];
  isEditing: boolean;
  onEdit: () => void;
  onSave: () => void;
  onCancel: () => void;
  onFieldChange: (field: string, value: string) => void;
}

const InfoField = ({ label, value, id, isEditing, onChange }: InfoFieldProps) => {
  return (
    <div className="grid w-full grid-cols-[120px_1fr] items-center gap-1 py-1">
      <Label htmlFor={id} className="text-sm">{label}:</Label>
      {isEditing && onChange ? (
        <Input id={id} value={value || ''} onChange={(e) => onChange(e.target.value)} className="h-8" />
      ) : (
        <div className="border-b border-gray-200">{value}</div>
      )}
    </div>
  );
};

const InfoSectionComponent = ({ title, fields, isEditing, onInputChange }: InfoSectionProps) => {
  return (
    <div className="space-y-1">
      {title && <h3 className="text-lg font-medium">{title}</h3>}
      <div className="space-y-0">
        {fields.map((field) => (
          <InfoField
            key={field.id}
            label={field.label}
            value={field.value}
            id={field.id}
            isEditing={isEditing && field.editable}
            onChange={field.editable ? (value) => onInputChange(field.id, value) : undefined}
          />
        ))}
      </div>
    </div>
  );
};

export const AppInfoCard = ({
  title,
  sections,
  isEditing,
  onEdit,
  onSave,
  onCancel,
  onFieldChange,
}: AppInfoCardProps) => {
  return (
    <Card className="overflow-auto">
      <CardHeader className="flex flex-row items-center justify-between py-2">
        <CardTitle className="text-lg font-medium">{title}</CardTitle>
        {!isEditing ? (
          <Button variant="ghost" size="icon" onClick={onEdit}>
            <Pencil className="h-4 w-4 text-green-500" />
          </Button>
        ) : (
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={onCancel}>Cancel</Button>
            <Button size="sm" onClick={onSave}>Save</Button>
          </div>
        )}
      </CardHeader>
      <CardContent className="overflow-y-auto max-h-[calc(100%-60px)]">
        {sections.map((section, index) => (
          <div key={section.title || index}>
            {index > 0 && <Separator className="my-3" />}
            <InfoSectionComponent
              title={section.title}
              fields={section.fields}
              isEditing={isEditing}
              onInputChange={onFieldChange}
            />
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export type { FieldData, InfoSection };
