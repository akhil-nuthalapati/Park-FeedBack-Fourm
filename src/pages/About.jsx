import { Info, QrCode, MessageSquare, Wrench, ShieldCheck, Clock } from 'lucide-react';
import Card from '../components/Card';

export default function About() {
  return (
    <div className="page-container max-w-4xl">
      <div className="text-center mb-12">
        <h1 className="section-title">About the Park Maintenance System</h1>
        <p className="section-subtitle">A Smart City initiative to better maintain our public spaces.</p>
      </div>

      <div className="mb-12">
        <Card hoverable={false} className="bg-primary text-white border-none text-center p-8">
          <h2 className="text-2xl font-bold mb-4">Our Purpose</h2>
          <p className="text-lg text-primary-light max-w-2xl mx-auto leading-relaxed">
            The Park Maintenance System is designed to create a transparent, efficient, 
            and citizen-driven approach to managing public parks. By leveraging technology, 
            we aim to ensure our green spaces remain clean, safe, and enjoyable for everyone.
          </p>
        </Card>
      </div>

      <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">How It Works</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
        <Card className="border-t-4 border-t-blue-500">
          <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center mb-4">
            <QrCode size={24} />
          </div>
          <h3 className="text-xl font-bold mb-2">1. Scan & Check-in</h3>
          <p className="text-gray-600">
            Scan the QR code at the park entrance to instantly register your visit. 
            This helps us understand park usage patterns and allocate resources effectively.
          </p>
        </Card>
        
        <Card className="border-t-4 border-t-green-500">
          <div className="w-12 h-12 bg-green-50 text-green-600 rounded-lg flex items-center justify-center mb-4">
            <MessageSquare size={24} />
          </div>
          <h3 className="text-xl font-bold mb-2">2. Share Feedback</h3>
          <p className="text-gray-600">
            Rate various facilities like cleanliness, safety, and lighting. 
            Your anonymous feedback directly influences our maintenance priorities.
          </p>
        </Card>
        
        <Card className="border-t-4 border-t-orange-500">
          <div className="w-12 h-12 bg-orange-50 text-orange-600 rounded-lg flex items-center justify-center mb-4">
            <Wrench size={24} />
          </div>
          <h3 className="text-xl font-bold mb-2">3. Report Issues</h3>
          <p className="text-gray-600">
            Spot a broken bench or an overflowing dustbin? Report it instantly with a photo. 
            The appropriate staff is notified immediately for quick resolution.
          </p>
        </Card>
      </div>

      <div className="bg-gray-50 rounded-2xl p-8 md:p-12 border border-gray-100">
        <h2 className="text-2xl font-bold text-gray-800 mb-8 text-center">Benefits of the System</h2>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-8 gap-x-12">
          <div className="flex gap-4">
            <div className="mt-1 text-primary">
              <ShieldCheck size={24} />
            </div>
            <div>
              <h4 className="font-bold text-gray-800 mb-1">Improved Safety</h4>
              <p className="text-sm text-gray-600">Faster response times for safety hazards and lighting issues.</p>
            </div>
          </div>
          
          <div className="flex gap-4">
            <div className="mt-1 text-primary">
              <Clock size={24} />
            </div>
            <div>
              <h4 className="font-bold text-gray-800 mb-1">Quicker Resolution</h4>
              <p className="text-sm text-gray-600">Direct assignment of maintenance tasks to on-ground staff.</p>
            </div>
          </div>
          
          <div className="flex gap-4">
            <div className="mt-1 text-primary">
              <Info size={24} />
            </div>
            <div>
              <h4 className="font-bold text-gray-800 mb-1">Data-Driven Decisions</h4>
              <p className="text-sm text-gray-600">Footfall analytics help in planning better facilities and budget allocation.</p>
            </div>
          </div>
          
          <div className="flex gap-4">
            <div className="mt-1 text-primary">
              <QrCode size={24} />
            </div>
            <div>
              <h4 className="font-bold text-gray-800 mb-1">Contactless Experience</h4>
              <p className="text-sm text-gray-600">No apps to download. Everything works directly from your phone's browser.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
