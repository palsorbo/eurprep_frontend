'use client'

import { ChevronRight } from 'lucide-react'
import { Link } from 'react-router-dom'

export interface BreadcrumbItem {
    label: string
    href?: string
    icon?: React.ComponentType<{ className?: string }>
}

interface BreadcrumbProps {
    items: BreadcrumbItem[]
    className?: string
}

export default function Breadcrumb({ items, className = '' }: BreadcrumbProps) {
    return (
        <nav className={`flex items-center space-x-2 text-sm ${className}`} aria-label="Breadcrumb">
            {items.map((item, index) => {
                const isLast = index === items.length - 1
                const IconComponent = item.icon

                return (
                    <div key={index} className="flex items-center space-x-2">
                        {index > 0 && (
                            <ChevronRight className="w-4 h-4 text-gray-400" />
                        )}

                        {isLast ? (
                            <span className="text-gray-900 font-medium flex items-center space-x-1">
                                {IconComponent && <IconComponent className="w-4 h-4" />}
                                <span>{item.label}</span>
                            </span>
                        ) : (
                            <Link
                                to={item.href || '#'}
                                className="text-gray-600 hover:text-gray-900 transition-colors flex items-center space-x-1"
                            >
                                {IconComponent && <IconComponent className="w-4 h-4" />}
                                <span>{item.label}</span>
                            </Link>
                        )}
                    </div>
                )
            })}
        </nav>
    )
} 