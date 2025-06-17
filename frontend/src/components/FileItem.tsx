

import { File, Folder } from 'lucide-react';

export interface FileItemProps {
  name: string;
  type: 'file' | 'directory';
}

function FileItem({ name, type }: FileItemProps) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', paddingLeft: '20px' }}>
      {type === 'directory' ? <Folder size={16} /> : <File size={16} />}
      <span>{name}</span>
    </div>
  );
}

export default FileItem;