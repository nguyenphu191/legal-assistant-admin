'use client';
import { ValidationIssue } from '../../types';
import styles from './ValidationIssues.module.css';

interface ValidationIssuesProps {
  issues: ValidationIssue[];
}

const ValidationIssues = ({ issues }: ValidationIssuesProps) => {
  const getIssueIcon = (type: ValidationIssue['type']) => {
    switch (type) {
      case 'error':
        return '🔴';
      case 'warning':
        return '🟡';
      case 'suggestion':
        return '🔵';
      default:
        return '📝';
    }
  };

  const getIssueClass = (type: ValidationIssue['type']) => {
    switch (type) {
      case 'error':
        return styles.issueError;
      case 'warning':
        return styles.issueWarning;
      case 'suggestion':
        return styles.issueSuggestion;
      default:
        return styles.issueDefault;
    }
  };

  if (issues.length === 0) return null;

  return (
    <div className={styles.container}>
      <h4 className={styles.title}>Vấn đề cần xử lý:</h4>
      <div className={styles.issuesList}>
        {issues.map((issue, index) => (
          <div 
            key={index} 
            className={`${styles.issue} ${getIssueClass(issue.type)}`}
          >
            <span className={styles.issueIcon}>
              {getIssueIcon(issue.type)}
            </span>
            <div className={styles.issueContent}>
              <span className={styles.issueMessage}>{issue.message}</span>
              {issue.line && (
                <span className={styles.issueLocation}>
                  Dòng {issue.line}{issue.column ? `, cột ${issue.column}` : ''}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ValidationIssues;