import { useAuth } from "../context/AuthContext";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { 
  User, Mail, Phone, Droplets, MapPin, 
  GraduationCap, Calendar, Shield, Heart, 
  BookOpen, CreditCard, Users, AlertCircle
} from "lucide-react";
import { useState } from "react";

export default function Profile() {
  const { user } = useAuth();
  const [showEditMessage, setShowEditMessage] = useState(false);

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-700">Please login to view profile</h1>
        </div>
      </div>
    );
  }

  const handleEditProfile = () => {
    setShowEditMessage(true);
    setTimeout(() => setShowEditMessage(false), 3000);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold text-gray-900">Student Profile</h1>
        <p className="text-gray-600 mt-2">Manage your personal information</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Left Column - Profile Card */}
        <div className="lg:col-span-1 space-y-6">
          <Card className="p-8 text-center">
          <Avatar className="w-32 h-32 mx-auto mb-6 rounded-full overflow-hidden">
  {user.avatarUrl && (
    <AvatarImage 
      src={user.avatarUrl}
      alt={user.name}
      className="w-full h-full object-cover object-[50%_25%]"
    />
  )}
  <AvatarFallback className="text-4xl bg-gradient-to-br from-gray-200 to-gray-300">
    {user.name.charAt(0)}
  </AvatarFallback>
</Avatar>
            
            <h2 className="text-2xl font-bold text-gray-900">{user.name}</h2>
            <p className="text-gray-600 mt-1">{user.studentId}</p>
            <p className="text-gray-500 text-sm mt-2">{user.department}</p>
            
            <div className="mt-6 space-y-3">
              <div className="flex items-center justify-center gap-2">
                <GraduationCap className="w-5 h-5 text-gray-500" />
                <span className="text-gray-700">{user.year}</span>
              </div>
              <div className="flex items-center justify-center gap-2">
                <Calendar className="w-5 h-5 text-gray-500" />
                <span className="text-gray-700">DOB: {user.dateOfBirth}</span>
              </div>
            </div>
            
            <Button 
              className="w-full mt-8" 
              variant="outline"
              onClick={handleEditProfile}
            >
              Edit Profile
            </Button>
            
            {showEditMessage && (
              <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-center gap-2 text-yellow-700">
                  <AlertCircle className="w-4 h-4" />
                  <span className="text-sm font-medium">
                    You don't have access to edit profile. Please contact the admin.
                  </span>
                </div>
              </div>
            )}
          </Card>

          {/* Emergency Info */}
          <Card className="p-6 bg-gradient-to-r from-red-50 to-orange-50 border-red-200">
            <div className="flex items-center gap-3 mb-4">
              <Heart className="w-6 h-6 text-red-600" />
              <h3 className="font-semibold text-gray-800">Emergency Information</h3>
            </div>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-600">Blood Group</p>
                <p className="font-semibold text-gray-900">{user.bloodGroup}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Emergency Contact</p>
                <p className="font-semibold text-gray-900">{user.emergencyContact}</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Right Column - Detailed Information */}
        <div className="lg:col-span-2 space-y-6">
          {/* Contact Information */}
          <Card className="p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-6">Contact Information</h3>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Mail className="w-5 h-5 text-blue-600 mt-1" />
                  <div>
                    <p className="text-sm text-gray-600">Email Address</p>
                    <p className="font-medium text-gray-900">{user.email}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Phone className="w-5 h-5 text-blue-600 mt-1" />
                  <div>
                    <p className="text-sm text-gray-600">Phone Number</p>
                    <p className="font-medium text-gray-900">{user.contact}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-blue-600 mt-1" />
                  <div>
                    <p className="text-sm text-gray-600">Residential Address</p>
                    <p className="font-medium text-gray-900">{user.address}</p>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Users className="w-5 h-5 text-green-600 mt-1" />
                  <div>
                    <p className="text-sm text-gray-600">Guardian Name</p>
                    <p className="font-medium text-gray-900">{user.guardianName}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Droplets className="w-5 h-5 text-red-600 mt-1" />
                  <div>
                    <p className="text-sm text-gray-600">Blood Group</p>
                    <p className="font-medium text-gray-900">{user.bloodGroup}</p>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* Family Information */}
          <Card className="p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-6">Family Information</h3>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-600">Father's Name</p>
                  <p className="font-medium text-gray-900">{user.fatherName}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Father's Contact</p>
                  <p className="font-medium text-gray-900">{user.fatherContact}</p>
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-600">Mother's Name</p>
                  <p className="font-medium text-gray-900">{user.motherName}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Mother's Contact</p>
                  <p className="font-medium text-gray-900">{user.motherContact}</p>
                </div>
              </div>
            </div>
          </Card>

          {/* Academic Information */}
          <Card className="p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-6">Academic Information</h3>
            <div className="grid md:grid-cols-3 gap-6">
              <div>
                <p className="text-sm text-gray-600">Student ID</p>
                <p className="font-medium text-gray-900">{user.studentId}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Department</p>
                <p className="font-medium text-gray-900">{user.department}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Year</p>
                <p className="font-medium text-gray-900">{user.year}</p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}