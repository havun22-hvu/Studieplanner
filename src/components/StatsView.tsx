import type { Subject, PlannedSession } from '../types';

interface Props {
  subjects: Subject[];
  sessions: PlannedSession[];
}

interface SubjectStats {
  name: string;
  color: string;
  examDate: string;
  totalMinutesPlanned: number;
  totalMinutesActual: number;
  blzPlanned: number;
  blzActual: number;
  opdrPlanned: number;
  opdrActual: number;
  blzPerHour: number;
  opdrPerHour: number;
  sessionsCompleted: number;
  sessionsTotal: number;
}

export function StatsView({ subjects, sessions }: Props) {
  // Calculate stats per subject
  const getSubjectStats = (): SubjectStats[] => {
    return subjects.map(subject => {
      const subjectSessions = sessions.filter(s => s.subjectId === subject.id);
      const completedSessions = subjectSessions.filter(s => s.completed);

      let totalMinutesPlanned = 0;
      let totalMinutesActual = 0;
      let blzPlanned = 0;
      let blzActual = 0;
      let opdrPlanned = 0;
      let opdrActual = 0;

      subjectSessions.forEach(session => {
        totalMinutesPlanned += session.minutesPlanned;
        if (session.minutesActual) {
          totalMinutesActual += session.minutesActual;
        }

        if (session.unit === 'blz') {
          blzPlanned += session.amountPlanned;
          if (session.amountActual) blzActual += session.amountActual;
        } else if (session.unit === 'opdrachten') {
          opdrPlanned += session.amountPlanned;
          if (session.amountActual) opdrActual += session.amountActual;
        }
      });

      // Calculate speed (per hour)
      const blzPerHour = totalMinutesActual > 0 && blzActual > 0
        ? Math.round((blzActual / totalMinutesActual) * 60)
        : 0;
      const opdrPerHour = totalMinutesActual > 0 && opdrActual > 0
        ? Math.round((opdrActual / totalMinutesActual) * 60 * 10) / 10
        : 0;

      return {
        name: subject.name,
        color: subject.color,
        examDate: subject.examDate,
        totalMinutesPlanned,
        totalMinutesActual,
        blzPlanned,
        blzActual,
        opdrPlanned,
        opdrActual,
        blzPerHour,
        opdrPerHour,
        sessionsCompleted: completedSessions.length,
        sessionsTotal: subjectSessions.length,
      };
    });
  };

  const stats = getSubjectStats();

  // Calculate totals
  const totals = stats.reduce(
    (acc, s) => ({
      minutesPlanned: acc.minutesPlanned + s.totalMinutesPlanned,
      minutesActual: acc.minutesActual + s.totalMinutesActual,
      blzPlanned: acc.blzPlanned + s.blzPlanned,
      blzActual: acc.blzActual + s.blzActual,
      opdrPlanned: acc.opdrPlanned + s.opdrPlanned,
      opdrActual: acc.opdrActual + s.opdrActual,
      sessionsCompleted: acc.sessionsCompleted + s.sessionsCompleted,
      sessionsTotal: acc.sessionsTotal + s.sessionsTotal,
    }),
    { minutesPlanned: 0, minutesActual: 0, blzPlanned: 0, blzActual: 0, opdrPlanned: 0, opdrActual: 0, sessionsCompleted: 0, sessionsTotal: 0 }
  );

  // Calculate overall average speeds
  const avgBlzPerHour = totals.minutesActual > 0 && totals.blzActual > 0
    ? Math.round((totals.blzActual / totals.minutesActual) * 60)
    : 0;
  const avgOpdrPerHour = totals.minutesActual > 0 && totals.opdrActual > 0
    ? Math.round((totals.opdrActual / totals.minutesActual) * 60 * 10) / 10
    : 0;

  const formatTime = (minutes: number) => {
    const hrs = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hrs === 0) return `${mins}m`;
    return mins > 0 ? `${hrs}u ${mins}m` : `${hrs}u`;
  };

  const getDaysUntil = (dateStr: string) => {
    const exam = new Date(dateStr);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    exam.setHours(0, 0, 0, 0);
    return Math.ceil((exam.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  };

  // Calculate planning feedback
  const getPlanningFeedback = (stat: SubjectStats) => {
    if (stat.totalMinutesActual === 0) {
      return { type: 'neutral', message: 'Nog geen sessies voltooid' };
    }

    const remainingMinutesPlanned = stat.totalMinutesPlanned - stat.totalMinutesActual;
    const daysLeft = getDaysUntil(stat.examDate);

    // Compare actual speed vs planned speed
    const plannedSpeed = stat.totalMinutesPlanned > 0
      ? (stat.blzPlanned + stat.opdrPlanned) / stat.totalMinutesPlanned
      : 0;
    const actualSpeed = stat.totalMinutesActual > 0
      ? (stat.blzActual + stat.opdrActual) / stat.totalMinutesActual
      : 0;

    if (actualSpeed === 0 || plannedSpeed === 0) {
      return { type: 'neutral', message: 'Te weinig data voor analyse' };
    }

    const speedRatio = actualSpeed / plannedSpeed;

    if (speedRatio >= 1.1) {
      const timeSaved = Math.round(remainingMinutesPlanned * (1 - 1/speedRatio));
      return {
        type: 'positive',
        message: `Je studeert sneller dan gepland! ~${formatTime(timeSaved)} tijdwinst mogelijk.`
      };
    } else if (speedRatio >= 0.9) {
      return {
        type: 'neutral',
        message: 'Je ligt op schema.'
      };
    } else {
      const extraTimeNeeded = Math.round(remainingMinutesPlanned * (1/speedRatio - 1));
      const extraPerDay = daysLeft > 0 ? Math.round(extraTimeNeeded / daysLeft) : extraTimeNeeded;
      return {
        type: 'warning',
        message: `Je studeert langzamer dan gepland. ~${formatTime(extraTimeNeeded)} extra nodig (${formatTime(extraPerDay)}/dag).`
      };
    }
  };

  return (
    <div className="stats-view">
      <h2>Statistieken</h2>

      {/* Totaal overzicht */}
      <div className="stats-summary">
        <div className="summary-item">
          <span className="summary-value">{formatTime(totals.minutesActual)}</span>
          <span className="summary-label">gestudeerd</span>
        </div>
        <div className="summary-item">
          <span className="summary-value">{totals.blzActual}</span>
          <span className="summary-label">blz gedaan</span>
        </div>
        <div className="summary-item">
          <span className="summary-value">{totals.opdrActual}</span>
          <span className="summary-label">opdrachten</span>
        </div>
        <div className="summary-item">
          <span className="summary-value">{totals.sessionsCompleted}/{totals.sessionsTotal}</span>
          <span className="summary-label">sessies af</span>
        </div>
      </div>

      {/* Gemiddelde snelheden */}
      {(avgBlzPerHour > 0 || avgOpdrPerHour > 0) && (
        <div className="stats-speed-summary">
          <h3>Jouw gemiddelde studiesnelheid</h3>
          <div className="speed-cards">
            {avgBlzPerHour > 0 && (
              <div className="speed-card">
                <span className="speed-value">{avgBlzPerHour}</span>
                <span className="speed-unit">blz/uur</span>
              </div>
            )}
            {avgOpdrPerHour > 0 && (
              <div className="speed-card">
                <span className="speed-value">{avgOpdrPerHour}</span>
                <span className="speed-unit">opdr/uur</span>
              </div>
            )}
          </div>
          <p className="speed-hint">Deze snelheden worden gebruikt voor slimmere planning</p>
        </div>
      )}

      {/* Per vak */}
      {stats.length === 0 ? (
        <p className="no-stats">Nog geen vakken toegevoegd.</p>
      ) : (
        <div className="stats-subjects">
          {stats.map((stat, index) => {
            const feedback = getPlanningFeedback(stat);
            const daysLeft = getDaysUntil(stat.examDate);
            const progress = stat.sessionsTotal > 0
              ? Math.round((stat.sessionsCompleted / stat.sessionsTotal) * 100)
              : 0;

            return (
              <div key={index} className="stats-subject-card" style={{ borderLeftColor: stat.color }}>
                <div className="stats-subject-header">
                  <h3 style={{ color: stat.color }}>{stat.name}</h3>
                  <span className={`days-badge ${daysLeft <= 3 ? 'urgent' : ''}`}>
                    {daysLeft <= 0 ? 'Vandaag' : `${daysLeft} dagen`}
                  </span>
                </div>

                <div className="stats-progress-bar">
                  <div
                    className="stats-progress-fill"
                    style={{ width: `${progress}%`, backgroundColor: stat.color }}
                  />
                </div>
                <p className="stats-progress-text">{progress}% voltooid</p>

                <div className="stats-grid">
                  <div className="stats-cell">
                    <span className="stats-label">Tijd gestudeerd</span>
                    <span className="stats-value">{formatTime(stat.totalMinutesActual)}</span>
                    <span className="stats-sub">van {formatTime(stat.totalMinutesPlanned)}</span>
                  </div>

                  {stat.blzPlanned > 0 && (
                    <div className="stats-cell">
                      <span className="stats-label">Bladzijden</span>
                      <span className="stats-value">{stat.blzActual} / {stat.blzPlanned}</span>
                      {stat.blzPerHour > 0 && (
                        <span className="stats-sub">{stat.blzPerHour} blz/uur</span>
                      )}
                    </div>
                  )}

                  {stat.opdrPlanned > 0 && (
                    <div className="stats-cell">
                      <span className="stats-label">Opdrachten</span>
                      <span className="stats-value">{stat.opdrActual} / {stat.opdrPlanned}</span>
                      {stat.opdrPerHour > 0 && (
                        <span className="stats-sub">{stat.opdrPerHour} opdr/uur</span>
                      )}
                    </div>
                  )}
                </div>

                <div className={`stats-feedback ${feedback.type}`}>
                  {feedback.message}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
