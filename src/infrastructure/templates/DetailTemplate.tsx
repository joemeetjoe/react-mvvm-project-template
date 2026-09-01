import { useLoaderData } from '@tanstack/react-router';
import { AppInfoCard, type InfoSection } from '@/infrastructure/components/app/AppInfoCard';
import { AppTableCard } from '@/infrastructure/components/app/AppTableCard';
import { ColumnDef } from '@tanstack/react-table';

interface TableConfig<T = any> {
  title: string;
  columns: ColumnDef<T>[];
  data: T[];
}

interface DetailTemplateProps {
  title?: string;
  sections?: InfoSection[];
  tables?: TableConfig[];
  isEditing?: boolean;
  onEdit?: () => void;
  onSave?: () => void;
  onCancel?: () => void;
  onFieldChange?: (field: string, value: string) => void;
}

interface LoaderData {
  detailProps?: DetailTemplateProps;
}

export const DetailTemplate: React.FC<DetailTemplateProps> = (props) => {
  const rawLoaderData = (useLoaderData({ strict: false }) as LoaderData) || {};

  const merged = { ...rawLoaderData.detailProps, ...props };
  const {
    title = 'Details',
    sections = [],
    tables = [],
    isEditing = false,
    onEdit = () => {},
    onSave = () => {},
    onCancel = () => {},
    onFieldChange = () => {},
  } = merged;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {sections.length > 0 && (
          <div className="w-full h-full">
            <AppInfoCard
              title={title}
              sections={sections}
              isEditing={isEditing}
              onEdit={onEdit}
              onSave={onSave}
              onCancel={onCancel}
              onFieldChange={onFieldChange}
            />
          </div>
        )}

        {tables.slice(0, 2).map((tableConfig, index) => (
          <div key={index} className="w-full h-full">
            <AppTableCard>
              <AppTableCard.Header title={tableConfig.title} />
              <AppTableCard.Content
                data={tableConfig.data}
                columns={tableConfig.columns}
                enableRowSelection={false}
                zebraStripes={true}
              />
              <AppTableCard.Footer showPagination={tableConfig.data.length > 10} />
            </AppTableCard>
          </div>
        ))}
      </div>

      {tables.slice(2).map((tableConfig, index) => (
        <div key={index} className="w-full">
          <AppTableCard>
            <AppTableCard.Header title={tableConfig.title} />
            <AppTableCard.Content
              data={tableConfig.data}
              columns={tableConfig.columns}
              enableRowSelection={false}
              zebraStripes={true}
            />
            <AppTableCard.Footer showPagination={tableConfig.data.length > 10} />
          </AppTableCard>
        </div>
      ))}
    </div>
  );
};
