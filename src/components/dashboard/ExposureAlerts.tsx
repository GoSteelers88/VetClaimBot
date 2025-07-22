import { AlertTriangle, MapPin, Calendar, ExternalLink } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ExposureAlert } from '@/types';
import { formatDate } from '@/lib/utils';

interface ExposureAlertsProps {
  alerts: ExposureAlert[];
  onAlertClick?: (alert: ExposureAlert) => void;
  onStartClaim?: (alert: ExposureAlert) => void;
}

export function ExposureAlerts({ alerts, onAlertClick, onStartClaim }: ExposureAlertsProps) {
  if (alerts.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center text-lg">
            <AlertTriangle className="h-5 w-5 text-gray-400 mr-2" />
            Exposure Alerts
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6">
            <AlertTriangle className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-sm">
              No exposure alerts at this time.
            </p>
            <p className="text-gray-400 text-xs mt-1">
              We'll notify you of potential benefits based on your service history.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between text-lg">
          <div className="flex items-center">
            <AlertTriangle className="h-5 w-5 text-orange-500 mr-2" />
            Exposure Alerts
            <span className="ml-2 bg-orange-100 text-orange-800 text-xs font-medium px-2 py-1 rounded-full">
              {alerts.length}
            </span>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {alerts.slice(0, 3).map((alert) => (
            <div 
              key={alert.id} 
              className="border border-orange-200 rounded-lg p-4 bg-orange-50 hover:bg-orange-100 transition-colors cursor-pointer"
              onClick={() => onAlertClick?.(alert)}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h4 className="font-semibold text-orange-900 mb-1">
                    {alert.conditionName}
                  </h4>
                  <p className="text-sm text-orange-700 mb-2 capitalize">
                    {alert.exposureType.replace(/_/g, ' ')} exposure
                  </p>
                  
                  <div className="flex items-center text-xs text-orange-600 space-x-4">
                    <div className="flex items-center">
                      <Calendar className="h-3 w-3 mr-1" />
                      {formatDate(alert.alertDate.toDate())}
                    </div>
                    {alert.deploymentReference && (
                      <div className="flex items-center">
                        <MapPin className="h-3 w-3 mr-1" />
                        Service-connected
                      </div>
                    )}
                  </div>
                </div>
                
                {!alert.acknowledged && (
                  <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                )}
              </div>
              
              {alert.claimSuggested && (
                <div className="mt-3 pt-3 border-t border-orange-200">
                  <Button 
                    size="sm" 
                    className="bg-orange-600 hover:bg-orange-700 text-white"
                    onClick={(e) => {
                      e.stopPropagation();
                      onStartClaim?.(alert);
                    }}
                  >
                    Start Claim
                    <ExternalLink className="h-3 w-3 ml-1" />
                  </Button>
                </div>
              )}
            </div>
          ))}
          
          {alerts.length > 3 && (
            <Button variant="outline" className="w-full">
              View All {alerts.length} Alerts
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}