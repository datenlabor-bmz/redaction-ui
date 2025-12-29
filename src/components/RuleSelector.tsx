import { useState } from 'react'
import { Tooltip } from './Tooltip'
import type { RedactionRule } from '../types'

function groupRulesByGroup(rules: RedactionRule[]) {
  const groups: Record<string, RedactionRule[]> = {}
  for (const rule of rules) {
    const group = rule.group || 'Ungrouped'
    if (!groups[group]) {
      groups[group] = []
    }
    groups[group].push(rule)
  }
  return groups
}

const Chevron = ({ isExpanded }: { isExpanded: boolean }) => (
  <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
    <svg
      style={{
        width: '0.75rem',
        height: '0.75rem',
        color: '#6b7280',
        flexShrink: 0
      }}
      fill='none'
      stroke='currentColor'
      viewBox='0 0 24 24'
      xmlns='http://www.w3.org/2000/svg'
    >
      {isExpanded ? (
        <path
          strokeLinecap='round'
          strokeLinejoin='round'
          strokeWidth='2'
          d='M19 9l-7 7-7-7'
        />
      ) : (
        <path
          strokeLinecap='round'
          strokeLinejoin='round'
          strokeWidth='2'
          d='M9 5l7 7-7 7'
        />
      )}
    </svg>
  </div>
)

const RuleTooltip = ({
  rule,
  maxLength = 500
}: {
  rule: RedactionRule
  maxLength?: number
}) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem', fontSize: '0.875rem' }}>
    <div style={{ fontWeight: '600' }}>{rule.reason}</div>
    <div style={{ fontStyle: 'italic' }}>{rule.reference}</div>
    <div>
      {rule.full_text && rule.full_text.length > maxLength
        ? `${rule.full_text.substring(0, maxLength)}...`
        : rule.full_text}
    </div>
    {rule.url && (
      <a
        href={rule.url}
        target='_blank'
        rel='noopener noreferrer'
        onMouseEnter={e => (e.currentTarget.style.textDecoration = 'underline')}
        onMouseLeave={e => (e.currentTarget.style.textDecoration = 'none')}
        onClick={e => e.stopPropagation()}
      >
        Gesetzestext
      </a>
    )}
  </div>
)

const gap = '0.2rem'
const selectedColor = '#e0e7ff'

const Item = ({ selected, children }: { selected: boolean; children: React.ReactNode }) => {
  return (
    <div
      style={{
        padding: '0.2rem',
        borderRadius: '0.2rem',
        backgroundColor: selected ? selectedColor : 'white'
      }}
      onMouseEnter={e => (e.currentTarget.style.backgroundColor = selected ? selectedColor : '#f3f4f6')}
      onMouseLeave={e => (e.currentTarget.style.backgroundColor = selected ? selectedColor : 'white')}
    >
      {children}
    </div>
  )
}

const RuleItem = ({
  rule,
  onRuleSelect,
  level = 0,
  selectedRule
}: {
  rule: RedactionRule
  onRuleSelect: (rule: RedactionRule) => void
  level?: number
  selectedRule?: RedactionRule
}) => (
  <Tooltip content={<RuleTooltip rule={rule} />} position='right'>
    <div style={{ display: 'flex', flexDirection: 'row', cursor: 'pointer' }} onClick={() => onRuleSelect(rule)}>
      <div style={{ width: `${level * 1.5}rem` }} />
      <div style={{ flexGrow: 1 }}>
        <Item selected={selectedRule === rule}>
          <div>{rule.title}</div>
        </Item>
      </div>
    </div>
  </Tooltip>
)

const ParentItem = ({
  title,
  childRules,
  level = 0,
  isExpanded,
  toggleGroupExpansion,
  onRuleSelect,
  selectedRule
}: {
  title: string
  childRules: RedactionRule[]
  level?: number
  isExpanded: boolean
  toggleGroupExpansion: (group: string) => void
  onRuleSelect: (rule: RedactionRule) => void
  selectedRule?: RedactionRule
}) => (
  <div>
    <Item selected={false}>
      <div
        style={{ display: 'flex', flexDirection: 'row', cursor: 'pointer' }}
        onClick={() => toggleGroupExpansion(title)}
      >
        <Chevron isExpanded={isExpanded} />
        {title}
      </div>
    </Item>
    {(isExpanded || selectedRule?.group === title) && (
      <div style={{ display: 'flex', flexDirection: 'column', gap: gap, paddingTop: gap }}>
        {childRules.map((rule, index) => (
          <RuleItem
            key={rule.title + index}
            rule={rule}
            onRuleSelect={onRuleSelect}
            level={level + 1}
            selectedRule={selectedRule}
          />
        ))}
      </div>
    )}
  </div>
)

export interface RuleSelectorProps {
  rules: RedactionRule[]
  selectedRule?: RedactionRule
  onRuleSelect: (rule?: RedactionRule) => void
  noRuleLabel?: string
  selectLabel?: string
}

export function RuleSelector({
  rules,
  onRuleSelect,
  selectedRule,
  noRuleLabel = 'Keine Regel',
  selectLabel = 'Schwärzungsgrund auswählen'
}: RuleSelectorProps) {
  const [expandedGroup, setExpandedGroup] = useState<string | null>(null)
  const ruleGroups = groupRulesByGroup(rules)

  return (
    <div
      style={{
        width: '15rem',
        display: 'flex',
        flexDirection: 'column',
        gap: gap,
        backgroundColor: 'white',
        border: '1px solid #d1d5db',
        borderRadius: '0.375rem',
        padding: '0.5rem',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        fontSize: '0.875rem',
        cursor: 'default',
        userSelect: 'none'
      }}
    >
      <div style={{ fontSize: '0.6rem', color: '#6b7280' }}>
        {selectLabel}
      </div>
      {Object.entries(ruleGroups).map(([group, groupRules]) => {
        if (groupRules.length === 1) {
          return (
            <RuleItem
              key={group}
              rule={groupRules[0]}
              onRuleSelect={onRuleSelect}
              selectedRule={selectedRule}
            />
          )
        }
        return (
          <ParentItem
            key={group}
            title={group}
            childRules={groupRules}
            isExpanded={expandedGroup === group}
            toggleGroupExpansion={() =>
              setExpandedGroup(expandedGroup === group ? null : group)
            }
            onRuleSelect={onRuleSelect}
            selectedRule={selectedRule}
          />
        )
      })}
      <div
        onClick={() => onRuleSelect(undefined)}
        style={{ cursor: 'pointer', fontStyle: 'italic', color: '#6b7280' }}
      >
        <Item selected={selectedRule === undefined}>
          {noRuleLabel}
        </Item>
      </div>
    </div>
  )
}

