import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { ExternalLink } from 'lucide-react';
import { Email, CATEGORY_MAPPING } from './constants';
import Group26649 from '../../imports/Group26649';

interface EmailsTableProps {
  loading: boolean;
  emails: Email[];
  user: any;
  onCorrectnessChange: (id: string, value: string) => void;
  onLinkClick: (id: string) => void;
}

export const EmailsTable: React.FC<EmailsTableProps> = ({
  loading,
  emails,
  user,
  onCorrectnessChange,
  onLinkClick
}) => {
  const formatDate = (isoString: string) => {
    try {
      const date = new Date(isoString);
      return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' }).format(date);
    } catch (e) {
      return isoString;
    }
  };

  return (
    <main className="col-span-12 bg-white border border-slate-200 rounded-lg overflow-hidden shadow-sm mt-2 min-h-[400px]">
      <div className="p-0">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50/50 hover:bg-slate-50/50 text-slate-600">
              <TableHead className="w-[200px] h-12 font-semibold pl-4">Sender</TableHead>
              <TableHead className="w-[300px] h-12 font-semibold">Title</TableHead>
              <TableHead className="w-[150px] h-12 font-semibold">Category</TableHead>
              <TableHead className="w-[250px] h-12 font-semibold">Purpose</TableHead>
              <TableHead className="w-[150px] h-12 font-semibold">Correctness</TableHead>
              <TableHead className="text-right h-12 font-semibold pr-6">Link to mail</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading && emails.length === 0 ? (
              // Loading state
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={`loading-${i}`} className="border-slate-100">
                  <TableCell className="py-4 pl-4"><div className="h-4 w-24 bg-slate-100 rounded animate-pulse"></div></TableCell>
                  <TableCell className="py-4"><div className="h-4 w-48 bg-slate-100 rounded animate-pulse"></div></TableCell>
                  <TableCell className="py-4"><div className="h-4 w-20 bg-slate-100 rounded animate-pulse"></div></TableCell>
                  <TableCell className="py-4"><div className="h-4 w-32 bg-slate-100 rounded animate-pulse"></div></TableCell>
                  <TableCell className="py-4"><div className="h-8 w-24 bg-slate-100 rounded animate-pulse"></div></TableCell>
                  <TableCell className="py-4"><div className="h-8 w-8 bg-slate-100 rounded-full ml-auto animate-pulse"></div></TableCell>
                </TableRow>
              ))
            ) : !user ? (
              <TableRow>
                <TableCell colSpan={6} className="h-[500px]">
                  <div className="flex flex-col items-center justify-center h-full gap-6">
                    <div className="w-[400px] h-[277px] relative">
                      <Group26649 />
                    </div>
                    <div className="flex flex-col items-center gap-2 text-center">
                      <p className="text-slate-900 text-lg font-semibold">Please login to check incoming emails</p>
                      <p className="text-slate-500 text-sm">Connect your account to verify and manage incoming emails</p>
                    </div>
                  </div>
                </TableCell>
              </TableRow>
            ) : emails.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-64 text-center text-slate-500">
                  No emails found. Click 'Fetch Mail' to simulate new emails.
                </TableCell>
              </TableRow>
            ) : (
              emails.map((email) => (
                <TableRow key={email.id} className="hover:bg-slate-50 border-slate-100 group">
                  <TableCell className="font-medium text-slate-900 py-4 align-top pl-4">
                    {email.sender}
                  </TableCell>
                  <TableCell className="py-4 align-top">
                    <div className="flex flex-col">
                      <span className="font-medium text-slate-900" title={email.subject}>
                        {email.subject.length > 50 
                          ? `${email.subject.substring(0, 50)}...` 
                          : email.subject}
                      </span>
                      <span className="text-xs text-slate-400 mt-1">
                        {formatDate(email.date)}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="py-4 align-top">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-800 whitespace-nowrap">
                      {CATEGORY_MAPPING[email.category] || email.category}
                    </span>
                  </TableCell>
                  <TableCell className="py-4 text-slate-600 text-sm align-top">
                    {email.purpose}
                  </TableCell>
                  <TableCell className="py-4 align-top">
                    <div className="w-[110px]">
                      <Select
                        value={email.correctness || "none"}
                        onValueChange={(val) => onCorrectnessChange(email.id, val === "none" ? "" : val)}
                      >
                        <SelectTrigger className={`h-8 text-xs bg-white border-slate-200 ${email.correctness === 'correct' ? 'text-green-600 border-green-200 bg-green-50' : email.correctness === 'wrong' ? 'text-red-600 border-red-200 bg-red-50' : ''}`}>
                          <SelectValue placeholder="Select" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none" className="text-slate-600 focus:text-slate-700 flex items-center gap-2">
                            <span>None</span>
                          </SelectItem>
                          <SelectItem value="correct" className="text-green-600 focus:text-green-700 flex items-center gap-2">
                            <span>Correct</span>
                          </SelectItem>
                          <SelectItem value="wrong" className="text-red-600 focus:text-red-700 flex items-center gap-2">
                            <span>Wrong</span>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </TableCell>
                  <TableCell className="text-center py-4 align-top pr-6">
                    <a
                      href={email.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-slate-50 text-slate-400 hover:bg-[#0767B0]/10 hover:text-[#0767B0] transition-colors"
                      onClick={() => onLinkClick(email.id)}
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      <div className="px-4 py-3 bg-slate-50/50 border-t border-slate-100 text-xs text-slate-500 font-medium">
        Showing {emails.length} emails
      </div>
    </main>
  );
};
