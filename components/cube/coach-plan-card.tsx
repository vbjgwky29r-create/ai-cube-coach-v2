import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { MapPin } from 'lucide-react'

type LinkItem = {
  title: string
  url: string
}

type Recommendation = {
  priority?: number
  title?: string
  resourceLinks?: LinkItem[]
}

type WeeklyPlanItem = {
  day?: number
  focus?: string
  durationMinutes?: number
}

type CoachPlan = {
  weeklyPlan?: WeeklyPlanItem[]
  learningResources?: LinkItem[]
}

type AnalyzeResult = {
  prioritizedRecommendations?: Recommendation[]
  coachPlan?: CoachPlan
}

export function CoachPlanCard({ result }: { result: AnalyzeResult | null }) {
  if (!result) return null

  const fromRecommendations =
    result.prioritizedRecommendations
      ?.slice(0, 3)
      .flatMap((rec) => rec.resourceLinks || [])
      .filter((v, i, arr) => arr.findIndex((x) => x.url === v.url) === i) || []

  const fromCoachPlan = result.coachPlan?.learningResources || []
  const links = [...fromCoachPlan, ...fromRecommendations].filter(
    (v, i, arr) => arr.findIndex((x) => x.url === v.url) === i,
  )

  const weekly = result.coachPlan?.weeklyPlan || []
  if (weekly.length === 0 && links.length === 0) return null

  return (
    <Card className="card-cube shadow-sm result-card" style={{ animationDelay: '1250ms' }}>
      <CardHeader className="border-b border-slate-100">
        <CardTitle className="flex items-center gap-2">
          <MapPin className="w-4 h-4 text-blue-500" />
          Coach Plan
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-3 space-y-3">
        {weekly.length > 0 && (
          <div className="space-y-1.5">
            <div className="text-xs font-medium text-slate-600">Weekly focus</div>
            {weekly.slice(0, 4).map((day, idx) => (
              <div key={idx} className="text-xs bg-slate-50 border border-slate-200 rounded p-2">
                <span className="font-medium">Day {day.day}:</span> {day.focus} ({day.durationMinutes}m)
              </div>
            ))}
          </div>
        )}
        {links.length > 0 && (
          <div className="space-y-1.5">
            <div className="text-xs font-medium text-slate-600">How to improve</div>
            <div className="flex flex-wrap gap-1.5">
              {links.slice(0, 8).map((link, idx) => (
                <a
                  key={idx}
                  href={link.url}
                  target="_blank"
                  rel="noreferrer"
                  className="px-2 py-0.5 rounded border border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors text-xs"
                >
                  {link.title}
                </a>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
