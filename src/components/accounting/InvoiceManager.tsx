'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  FileText, 
  DollarSign, 
  Calendar, 
  Send, 
  Download,
  Plus,
  Edit,
  Trash2,
  CheckCircle,
  Clock,
  AlertCircle,
  TrendingUp,
  Receipt,
  Calculator,
  Mail,
  Printer
} from 'lucide-react'
import { format } from 'date-fns'

interface InvoiceItem {
  id: string
  description: string
  quantity: number
  unitPrice: number
  taxRate: number
  discount: number
  total: number
}

interface Invoice {
  id: string
  invoiceNumber: string
  customerId: string
  customerName: string
  customerEmail: string
  issueDate: Date
  dueDate: Date
  status: 'DRAFT' | 'SENT' | 'PAID' | 'OVERDUE' | 'CANCELLED'
  items: InvoiceItem[]
  subtotal: number
  taxAmount: number
  discountAmount: number
  total: number
  currency: string
  notes?: string
  paymentTerms: string
  paymentMethod?: string
  paidDate?: Date
}

export default function InvoiceManager() {
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null)
  const [isCreating, setIsCreating] = useState(false)
  const [filter, setFilter] = useState<'ALL' | 'DRAFT' | 'SENT' | 'PAID' | 'OVERDUE'>('ALL')
  const [searchTerm, setSearchTerm] = useState('')

  // Mock data for demonstration
  useEffect(() => {
    const mockInvoices: Invoice[] = [
      {
        id: '1',
        invoiceNumber: 'INV-2024-001',
        customerId: 'cust-1',
        customerName: 'Acme Corporation',
        customerEmail: 'billing@acme.com',
        issueDate: new Date('2024-01-15'),
        dueDate: new Date('2024-02-15'),
        status: 'PAID',
        items: [
          {
            id: 'item-1',
            description: 'Consulting Services - January',
            quantity: 40,
            unitPrice: 150,
            taxRate: 0.1,
            discount: 0,
            total: 6600
          },
          {
            id: 'item-2',
            description: 'Software License',
            quantity: 5,
            unitPrice: 200,
            taxRate: 0.1,
            discount: 100,
            total: 990
          }
        ],
        subtotal: 7000,
        taxAmount: 700,
        discountAmount: 100,
        total: 7590,
        currency: 'USD',
        paymentTerms: 'Net 30',
        paymentMethod: 'Bank Transfer',
        paidDate: new Date('2024-02-10')
      },
      {
        id: '2',
        invoiceNumber: 'INV-2024-002',
        customerId: 'cust-2',
        customerName: 'TechStart Inc',
        customerEmail: 'finance@techstart.com',
        issueDate: new Date('2024-01-20'),
        dueDate: new Date('2024-02-20'),
        status: 'OVERDUE',
        items: [
          {
            id: 'item-3',
            description: 'Development Services',
            quantity: 80,
            unitPrice: 125,
            taxRate: 0.1,
            discount: 0,
            total: 11000
          }
        ],
        subtotal: 10000,
        taxAmount: 1000,
        discountAmount: 0,
        total: 11000,
        currency: 'USD',
        paymentTerms: 'Net 30'
      },
      {
        id: '3',
        invoiceNumber: 'INV-2024-003',
        customerId: 'cust-3',
        customerName: 'Global Enterprises',
        customerEmail: 'ap@globalent.com',
        issueDate: new Date('2024-01-25'),
        dueDate: new Date('2024-02-25'),
        status: 'SENT',
        items: [
          {
            id: 'item-4',
            description: 'Monthly Subscription',
            quantity: 1,
            unitPrice: 499,
            taxRate: 0.08,
            discount: 0,
            total: 538.92
          }
        ],
        subtotal: 499,
        taxAmount: 39.92,
        discountAmount: 0,
        total: 538.92,
        currency: 'USD',
        paymentTerms: 'Due on receipt'
      }
    ]
    setInvoices(mockInvoices)
  }, [])

  const calculateInvoiceTotals = (items: InvoiceItem[]) => {
    const subtotal = items.reduce((sum, item) => {
      return sum + (item.quantity * item.unitPrice)
    }, 0)

    const taxAmount = items.reduce((sum, item) => {
      return sum + (item.quantity * item.unitPrice * item.taxRate)
    }, 0)

    const discountAmount = items.reduce((sum, item) => {
      return sum + item.discount
    }, 0)

    const total = subtotal + taxAmount - discountAmount

    return { subtotal, taxAmount, discountAmount, total }
  }

  const createNewInvoice = () => {
    const newInvoice: Invoice = {
      id: `inv-${Date.now()}`,
      invoiceNumber: `INV-2024-${String(invoices.length + 1).padStart(3, '0')}`,
      customerId: '',
      customerName: '',
      customerEmail: '',
      issueDate: new Date(),
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      status: 'DRAFT',
      items: [],
      subtotal: 0,
      taxAmount: 0,
      discountAmount: 0,
      total: 0,
      currency: 'USD',
      paymentTerms: 'Net 30'
    }
    setSelectedInvoice(newInvoice)
    setIsCreating(true)
  }

  const sendInvoice = async (invoice: Invoice) => {
    // Simulate sending invoice
    console.log('Sending invoice:', invoice)
    
    // Update invoice status
    const updatedInvoices = invoices.map(inv => 
      inv.id === invoice.id ? { ...inv, status: 'SENT' as const } : inv
    )
    setInvoices(updatedInvoices)
    
    // Show success message
    alert(`Invoice ${invoice.invoiceNumber} sent to ${invoice.customerEmail}`)
  }

  const markAsPaid = (invoice: Invoice) => {
    const updatedInvoices = invoices.map(inv => 
      inv.id === invoice.id 
        ? { ...inv, status: 'PAID' as const, paidDate: new Date() } 
        : inv
    )
    setInvoices(updatedInvoices)
  }

  const downloadPDF = (invoice: Invoice) => {
    // Simulate PDF download
    console.log('Downloading PDF for invoice:', invoice.invoiceNumber)
    alert(`Downloading ${invoice.invoiceNumber}.pdf`)
  }

  const filteredInvoices = invoices.filter(invoice => {
    const matchesFilter = filter === 'ALL' || invoice.status === filter
    const matchesSearch = invoice.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         invoice.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesFilter && matchesSearch
  })

  const getStatusColor = (status: Invoice['status']) => {
    switch (status) {
      case 'PAID': return 'bg-green-100 text-green-800'
      case 'SENT': return 'bg-blue-100 text-blue-800'
      case 'DRAFT': return 'bg-gray-100 text-gray-800'
      case 'OVERDUE': return 'bg-red-100 text-red-800'
      case 'CANCELLED': return 'bg-gray-100 text-gray-500'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status: Invoice['status']) => {
    switch (status) {
      case 'PAID': return <CheckCircle className="w-4 h-4" />
      case 'SENT': return <Send className="w-4 h-4" />
      case 'DRAFT': return <Edit className="w-4 h-4" />
      case 'OVERDUE': return <AlertCircle className="w-4 h-4" />
      case 'CANCELLED': return <Trash2 className="w-4 h-4" />
      default: return <FileText className="w-4 h-4" />
    }
  }

  // Calculate summary metrics
  const totalRevenue = invoices
    .filter(inv => inv.status === 'PAID')
    .reduce((sum, inv) => sum + inv.total, 0)

  const pendingRevenue = invoices
    .filter(inv => inv.status === 'SENT' || inv.status === 'OVERDUE')
    .reduce((sum, inv) => sum + inv.total, 0)

  const overdueCount = invoices.filter(inv => inv.status === 'OVERDUE').length

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold text-green-600">
                  ${totalRevenue.toLocaleString()}
                </p>
              </div>
              <DollarSign className="w-8 h-8 text-green-600 opacity-20" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-blue-600">
                  ${pendingRevenue.toLocaleString()}
                </p>
              </div>
              <Clock className="w-8 h-8 text-blue-600 opacity-20" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Overdue</p>
                <p className="text-2xl font-bold text-red-600">{overdueCount}</p>
              </div>
              <AlertCircle className="w-8 h-8 text-red-600 opacity-20" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Invoices</p>
                <p className="text-2xl font-bold">{invoices.length}</p>
              </div>
              <FileText className="w-8 h-8 text-gray-600 opacity-20" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Invoice Management */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Invoice Management</CardTitle>
            <Button onClick={createNewInvoice}>
              <Plus className="w-4 h-4 mr-2" />
              New Invoice
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="flex gap-4 mb-6">
            <Input
              placeholder="Search invoices..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-xs"
            />
            <Select value={filter} onValueChange={(value: any) => setFilter(value)}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Invoices</SelectItem>
                <SelectItem value="DRAFT">Draft</SelectItem>
                <SelectItem value="SENT">Sent</SelectItem>
                <SelectItem value="PAID">Paid</SelectItem>
                <SelectItem value="OVERDUE">Overdue</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Invoice List */}
          <div className="space-y-2">
            {filteredInvoices.map((invoice) => (
              <motion.div
                key={invoice.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="border rounded-lg p-4 hover:bg-gray-50 cursor-pointer"
                onClick={() => setSelectedInvoice(invoice)}
              >
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-4">
                    <Receipt className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="font-medium">{invoice.invoiceNumber}</p>
                      <p className="text-sm text-gray-600">{invoice.customerName}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="font-semibold">${invoice.total.toLocaleString()}</p>
                      <p className="text-xs text-gray-500">
                        Due {format(invoice.dueDate, 'MMM dd, yyyy')}
                      </p>
                    </div>
                    
                    <Badge className={getStatusColor(invoice.status)}>
                      <span className="flex items-center gap-1">
                        {getStatusIcon(invoice.status)}
                        {invoice.status}
                      </span>
                    </Badge>

                    <div className="flex gap-2">
                      {invoice.status === 'DRAFT' && (
                        <Button
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation()
                            sendInvoice(invoice)
                          }}
                        >
                          <Send className="w-4 h-4" />
                        </Button>
                      )}
                      
                      {invoice.status === 'SENT' && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={(e) => {
                            e.stopPropagation()
                            markAsPaid(invoice)
                          }}
                        >
                          <CheckCircle className="w-4 h-4" />
                        </Button>
                      )}
                      
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={(e) => {
                          e.stopPropagation()
                          downloadPDF(invoice)
                        }}
                      >
                        <Download className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Average Invoice Value</p>
                <p className="text-xl font-semibold">
                  ${invoices.length > 0 
                    ? Math.round(invoices.reduce((sum, inv) => sum + inv.total, 0) / invoices.length).toLocaleString()
                    : 0}
                </p>
              </div>
              <Calculator className="w-6 h-6 text-gray-400" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Payment Success Rate</p>
                <p className="text-xl font-semibold">
                  {invoices.length > 0 
                    ? Math.round((invoices.filter(inv => inv.status === 'PAID').length / invoices.length) * 100)
                    : 0}%
                </p>
              </div>
              <TrendingUp className="w-6 h-6 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Avg. Payment Time</p>
                <p className="text-xl font-semibold">18 days</p>
              </div>
              <Calendar className="w-6 h-6 text-blue-500" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}