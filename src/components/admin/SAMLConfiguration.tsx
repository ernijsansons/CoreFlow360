/**
 * CoreFlow360 - SAML Configuration Component
 * Admin interface for managing enterprise SSO configurations
 */

'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/components/ui/use-toast';
import { 
  ShieldCheckIcon, 
  PlusIcon, 
  TrashIcon, 
  EditIcon,
  DownloadIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
  UsersIcon,
  ClockIcon,
  GlobeIcon,
  KeyIcon,
  LinkIcon
} from '@heroicons/react/24/outline';

interface SAMLConfig {
  id?: string;
  idpName: string;
  displayName: string;
  entryPoint: string;
  certificate: string;
  signatureAlgorithm?: 'sha1' | 'sha256' | 'sha512';
  identifierFormat?: string;
  acceptedClockSkewMs?: number;
  attributeMapping?: {
    email?: string;
    firstName?: string;
    lastName?: string;
    displayName?: string;
    department?: string;
    title?: string;
    groups?: string;
  };
  allowedDomains?: string[];
  autoProvisionUsers?: boolean;
  defaultRole?: 'USER' | 'MANAGER' | 'ADMIN';
  isActive?: boolean;
  stats?: {
    activeUsers: number;
    lastLogin: string | null;
  };
  metadataUrl?: string;
  loginUrl?: string;
}

export function SAMLConfiguration() {
  const [configurations, setConfigurations] = useState<SAMLConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [editingConfig, setEditingConfig] = useState<SAMLConfig | null>(null);
  const [testResults, setTestResults] = useState<Record<string, any>>({});
  const { toast } = useToast();

  // Form state
  const [formData, setFormData] = useState<SAMLConfig>({
    idpName: '',
    displayName: '',
    entryPoint: '',
    certificate: '',
    signatureAlgorithm: 'sha256',
    identifierFormat: 'urn:oasis:names:tc:SAML:1.1:nameid-format:emailAddress',
    acceptedClockSkewMs: 180000,
    attributeMapping: {
      email: 'email',
      firstName: 'firstName',
      lastName: 'lastName',
      displayName: 'displayName',
      department: 'department',
      title: 'title',
      groups: 'groups'
    },
    allowedDomains: [],
    autoProvisionUsers: true,
    defaultRole: 'USER'
  });

  useEffect(() => {
    fetchConfigurations();
  }, []);

  const fetchConfigurations = async () => {
    try {
      const response = await fetch('/api/admin/saml', {
        headers: {
          'x-api-version': 'v2'
        }
      });

      if (!response.ok) throw new Error('Failed to fetch configurations');

      const data = await response.json();
      setConfigurations(data.data);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load SAML configurations',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const method = editingConfig ? 'PATCH' : 'POST';
      const body = editingConfig 
        ? { idpName: editingConfig.idpName, ...formData }
        : formData;

      const response = await fetch('/api/admin/saml', {
        method,
        headers: {
          'Content-Type': 'application/json',
          'x-api-version': 'v2'
        },
        body: JSON.stringify(body)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to save configuration');
      }

      const data = await response.json();
      
      toast({
        title: 'Success',
        description: editingConfig 
          ? 'SAML configuration updated successfully'
          : 'SAML configuration created successfully'
      });

      setIsCreating(false);
      setEditingConfig(null);
      resetForm();
      fetchConfigurations();

    } catch (error) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive'
      });
    }
  };

  const handleDelete = async (idpName: string) => {
    if (!confirm('Are you sure you want to delete this configuration?')) return;

    try {
      const response = await fetch(`/api/admin/saml?idpName=${idpName}`, {
        method: 'DELETE',
        headers: {
          'x-api-version': 'v2'
        }
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete configuration');
      }

      toast({
        title: 'Success',
        description: 'SAML configuration deleted successfully'
      });

      fetchConfigurations();

    } catch (error) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive'
      });
    }
  };

  const handleTest = async (config: SAMLConfig) => {
    try {
      const response = await fetch('/api/admin/saml/test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-version': 'v2'
        },
        body: JSON.stringify({ idpName: config.idpName })
      });

      const result = await response.json();
      setTestResults({
        ...testResults,
        [config.idpName]: result
      });

      toast({
        title: result.success ? 'Connection Successful' : 'Connection Failed',
        description: result.success 
          ? 'IdP is reachable' 
          : `Failed to reach IdP: ${result.data?.error}`,
        variant: result.success ? 'default' : 'destructive'
      });

    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to test connection',
        variant: 'destructive'
      });
    }
  };

  const resetForm = () => {
    setFormData({
      idpName: '',
      displayName: '',
      entryPoint: '',
      certificate: '',
      signatureAlgorithm: 'sha256',
      identifierFormat: 'urn:oasis:names:tc:SAML:1.1:nameid-format:emailAddress',
      acceptedClockSkewMs: 180000,
      attributeMapping: {
        email: 'email',
        firstName: 'firstName',
        lastName: 'lastName',
        displayName: 'displayName',
        department: 'department',
        title: 'title',
        groups: 'groups'
      },
      allowedDomains: [],
      autoProvisionUsers: true,
      defaultRole: 'USER'
    });
  };

  const downloadMetadata = (config: SAMLConfig) => {
    if (config.metadataUrl) {
      window.open(config.metadataUrl, '_blank');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <ShieldCheckIcon className="h-6 w-6" />
            SAML SSO Configuration
          </h2>
          <p className="text-muted-foreground mt-1">
            Configure enterprise single sign-on for your organization
          </p>
        </div>
        {!isCreating && !editingConfig && (
          <Button onClick={() => setIsCreating(true)}>
            <PlusIcon className="h-4 w-4 mr-2" />
            Add SAML Provider
          </Button>
        )}
      </div>

      {/* Configuration Form */}
      {(isCreating || editingConfig) && (
        <Card>
          <CardHeader>
            <CardTitle>
              {editingConfig ? 'Edit SAML Configuration' : 'New SAML Configuration'}
            </CardTitle>
            <CardDescription>
              Configure SAML 2.0 identity provider settings
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <Tabs defaultValue="basic" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="basic">Basic Settings</TabsTrigger>
                  <TabsTrigger value="attributes">Attribute Mapping</TabsTrigger>
                  <TabsTrigger value="advanced">Advanced</TabsTrigger>
                </TabsList>

                <TabsContent value="basic" className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="idpName">IdP Identifier</Label>
                      <Input
                        id="idpName"
                        value={formData.idpName}
                        onChange={(e) => setFormData({ ...formData, idpName: e.target.value })}
                        placeholder="okta"
                        disabled={!!editingConfig}
                        required
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        Unique identifier for this IdP (lowercase, no spaces)
                      </p>
                    </div>

                    <div>
                      <Label htmlFor="displayName">Display Name</Label>
                      <Input
                        id="displayName"
                        value={formData.displayName}
                        onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                        placeholder="Okta SSO"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="entryPoint">IdP Entry Point URL</Label>
                    <Input
                      id="entryPoint"
                      type="url"
                      value={formData.entryPoint}
                      onChange={(e) => setFormData({ ...formData, entryPoint: e.target.value })}
                      placeholder="https://company.okta.com/app/app_id/sso/saml"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="certificate">X.509 Certificate</Label>
                    <Textarea
                      id="certificate"
                      value={formData.certificate}
                      onChange={(e) => setFormData({ ...formData, certificate: e.target.value })}
                      placeholder="-----BEGIN CERTIFICATE-----&#10;MIIDpDCCAoygAwIBAgIGAV2k...&#10;-----END CERTIFICATE-----"
                      rows={6}
                      className="font-mono text-xs"
                      required
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Paste the IdP's public certificate including BEGIN/END tags
                    </p>
                  </div>
                </TabsContent>

                <TabsContent value="attributes" className="space-y-4">
                  <div className="space-y-4">
                    <h3 className="text-sm font-medium">SAML Attribute Mapping</h3>
                    <p className="text-xs text-muted-foreground">
                      Map SAML attributes from your IdP to user fields
                    </p>

                    <div className="grid grid-cols-2 gap-4">
                      {Object.entries(formData.attributeMapping || {}).map(([key, value]) => (
                        <div key={key}>
                          <Label htmlFor={`attr-${key}`}>
                            {key.charAt(0).toUpperCase() + key.slice(1)}
                          </Label>
                          <Input
                            id={`attr-${key}`}
                            value={value}
                            onChange={(e) => setFormData({
                              ...formData,
                              attributeMapping: {
                                ...formData.attributeMapping,
                                [key]: e.target.value
                              }
                            })}
                            placeholder={`SAML attribute for ${key}`}
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="allowedDomains">Allowed Email Domains</Label>
                    <Input
                      id="allowedDomains"
                      value={formData.allowedDomains?.join(', ')}
                      onChange={(e) => setFormData({
                        ...formData,
                        allowedDomains: e.target.value.split(',').map(d => d.trim()).filter(Boolean)
                      })}
                      placeholder="company.com, subsidiary.com"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Comma-separated list of allowed email domains (leave empty to allow all)
                    </p>
                  </div>
                </TabsContent>

                <TabsContent value="advanced" className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="signatureAlgorithm">Signature Algorithm</Label>
                      <Select
                        value={formData.signatureAlgorithm}
                        onValueChange={(value: any) => setFormData({ ...formData, signatureAlgorithm: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="sha1">SHA-1</SelectItem>
                          <SelectItem value="sha256">SHA-256 (Recommended)</SelectItem>
                          <SelectItem value="sha512">SHA-512</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="clockSkew">Clock Skew Tolerance (ms)</Label>
                      <Input
                        id="clockSkew"
                        type="number"
                        value={formData.acceptedClockSkewMs}
                        onChange={(e) => setFormData({ 
                          ...formData, 
                          acceptedClockSkewMs: parseInt(e.target.value) 
                        })}
                        min="0"
                        max="300000"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Auto-provision Users</Label>
                      <p className="text-xs text-muted-foreground">
                        Automatically create users on first login
                      </p>
                    </div>
                    <Switch
                      checked={formData.autoProvisionUsers}
                      onCheckedChange={(checked) => setFormData({ ...formData, autoProvisionUsers: checked })}
                    />
                  </div>

                  {formData.autoProvisionUsers && (
                    <div>
                      <Label htmlFor="defaultRole">Default Role for New Users</Label>
                      <Select
                        value={formData.defaultRole}
                        onValueChange={(value: any) => setFormData({ ...formData, defaultRole: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="USER">User</SelectItem>
                          <SelectItem value="MANAGER">Manager</SelectItem>
                          <SelectItem value="ADMIN">Admin</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </TabsContent>
              </Tabs>

              <div className="flex gap-2 justify-end">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsCreating(false);
                    setEditingConfig(null);
                    resetForm();
                  }}
                >
                  Cancel
                </Button>
                <Button type="submit">
                  {editingConfig ? 'Update Configuration' : 'Create Configuration'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Configurations List */}
      {configurations.length === 0 && !isCreating ? (
        <Card>
          <CardContent className="text-center py-12">
            <ShieldCheckIcon className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No SAML Configurations</h3>
            <p className="text-muted-foreground mb-4">
              Get started by adding your first SAML identity provider
            </p>
            <Button onClick={() => setIsCreating(true)}>
              <PlusIcon className="h-4 w-4 mr-2" />
              Add SAML Provider
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {configurations.map((config) => (
            <Card key={config.idpName}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      {config.displayName}
                      <Badge variant={config.isActive ? 'default' : 'secondary'}>
                        {config.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </CardTitle>
                    <CardDescription className="mt-1">
                      IdP: {config.idpName} • Entry Point: {config.entryPoint}
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleTest(config)}
                    >
                      Test Connection
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => downloadMetadata(config)}
                    >
                      <DownloadIcon className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setEditingConfig(config);
                        setFormData(config);
                      }}
                    >
                      <EditIcon className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDelete(config.idpName)}
                    >
                      <TrashIcon className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-4 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <UsersIcon className="h-4 w-4 text-muted-foreground" />
                    <span>{config.stats?.activeUsers || 0} active users</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <ClockIcon className="h-4 w-4 text-muted-foreground" />
                    <span>
                      Last login: {config.stats?.lastLogin 
                        ? new Date(config.stats.lastLogin).toLocaleDateString()
                        : 'Never'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <GlobeIcon className="h-4 w-4 text-muted-foreground" />
                    <span>
                      {config.allowedDomains?.length || 0} allowed domains
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <KeyIcon className="h-4 w-4 text-muted-foreground" />
                    <span>{config.signatureAlgorithm?.toUpperCase()}</span>
                  </div>
                </div>

                {testResults[config.idpName] && (
                  <Alert className="mt-4" variant={testResults[config.idpName].success ? 'default' : 'destructive'}>
                    <AlertDescription className="flex items-center gap-2">
                      {testResults[config.idpName].success ? (
                        <>
                          <CheckCircleIcon className="h-4 w-4" />
                          IdP is reachable and responding
                        </>
                      ) : (
                        <>
                          <XCircleIcon className="h-4 w-4" />
                          {testResults[config.idpName].data?.error || 'Connection failed'}
                        </>
                      )}
                    </AlertDescription>
                  </Alert>
                )}

                {config.loginUrl && (
                  <div className="mt-4 p-3 bg-muted rounded-lg">
                    <div className="flex items-center gap-2 text-sm">
                      <LinkIcon className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">Login URL:</span>
                      <code className="text-xs bg-background px-2 py-1 rounded">
                        {config.loginUrl}
                      </code>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}