import React from 'react';
import { Eye, EyeOff } from 'lucide-react-native'; 

interface OlhoProps {
  visivel: boolean;
}

// 2. Aplicamos a tipagem ': OlhoProps' na função
export default function Olhoabrirefechar({ visivel }: OlhoProps) {
  if (visivel) {
    return <Eye color="#ffffff" size={22} style={{ marginRight: 8 }} />;
  }
  
  return <EyeOff color="#ffffff" size={22} style={{ marginRight: 8 }} />;
}
