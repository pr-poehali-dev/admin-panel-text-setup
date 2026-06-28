import { useState } from 'react';
import Icon from '@/components/ui/icon';

interface Step {
  id: string;
  text: string;
}

interface Stage {
  id: string;
  title: string;
  steps: Step[];
}

const initialStages: Stage[] = [
  {
    id: 's1',
    title: 'Определение условий сотрудничества',
    steps: [
      'Дождитесь звонок менеджера',
      'Ознакомьтесь с типовыми документами',
      'Предоставьте информацию о локации',
      'Ожидание оценки экономики',
      'Ознакомьтесь с оценкой экономики',
      'Подготовка СоН',
      'Заполните анкету',
      'Внесите обеспечительный платеж',
    ].map((text, i) => ({ id: `s1-${i}`, text })),
  },
  {
    id: 's2',
    title: 'Подбор локации',
    steps: [
      'Подбор локаций',
      'Посетите предложенные объекты',
      'Предоставьте предварительные договоренности по аренде',
    ].map((text, i) => ({ id: `s2-${i}`, text })),
  },
  {
    id: 's3',
    title: 'Защита на ИК',
    steps: [
      'Предоставьте данные для ИК',
      'Подготовка к аудиту',
      'Проведение ИК',
    ].map((text, i) => ({ id: `s3-${i}`, text })),
  },
  {
    id: 's4',
    title: 'Создание ЮЛ и подписание документов',
    steps: [
      'Создайте Юр. лицо',
      'Получите ЭЦП',
      'На проверке',
      'Создание учетной записи Х5',
      'Подпишите ДКК',
      'Создайте обособленное подразделение',
      'Заключите договор аренды',
      'Согласуйте планировки с расстановкой оборудования',
    ].map((text, i) => ({ id: `s4-${i}`, text })),
  },
  {
    id: 's5',
    title: 'Подготовка к проведению РСР',
    steps: [
      'Сформируйте план-график РСР',
      'Проведите РСР согласно ТЗ',
      'Проведите интернет-соединение',
      'Подключите СБП',
      'Подключитесь к ЕГАИС',
      'Подайте документы на получение алкогольной лицензии',
      'Зарегистрируйтесь в системе Честный Знак Меркурий',
      'Заключите договор на эквайринг со Сбербанком',
      'Внесите обеспечительный платеж',
      'Подключитесь к 5post',
      'Подключите функцию Экспресс-доставки',
      'Отобразить чек-лист этапа «Под ключ»',
      'Проведение РСР',
    ].map((text, i) => ({ id: `s5-${i}`, text })),
  },
  {
    id: 's6',
    title: 'Найм и обучение персонала',
    steps: [
      'Найм персонала',
      'Обучите персонал',
      'Получение доступа во внутренние системы ТС5',
    ].map((text, i) => ({ id: `s6-${i}`, text })),
  },
  {
    id: 's7',
    title: 'Открытие и запуск товародвижения',
    steps: [
      'Проведение РСР',
      'Запустите товародвижение',
      'Организация праздничного открытия',
      'Ознакомление и подписание оставшихся документов',
    ].map((text, i) => ({ id: `s7-${i}`, text })),
  },
];

export default function Index() {
  const [stages, setStages] = useState<Stage[]>(initialStages);
  const [openStage, setOpenStage] = useState<string | null>('s1');
  const [editing, setEditing] = useState<{ stageId: string; stepId: string } | null>(null);
  const [draft, setDraft] = useState('');

  const totalSteps = stages.reduce((sum, s) => sum + s.steps.length, 0);

  const startEdit = (stageId: string, step: Step) => {
    setEditing({ stageId, stepId: step.id });
    setDraft(step.text);
  };

  const saveEdit = () => {
    if (!editing) return;
    setStages((prev) =>
      prev.map((stage) =>
        stage.id === editing.stageId
          ? {
              ...stage,
              steps: stage.steps.map((step) =>
                step.id === editing.stepId ? { ...step, text: draft.trim() || step.text } : step
              ),
            }
          : stage
      )
    );
    setEditing(null);
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border bg-white/80 backdrop-blur sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-brand flex items-center justify-center text-white font-bold tracking-tight">
              X5
            </div>
            <div>
              <div className="text-sm font-semibold leading-tight">Админ-панель франшизы</div>
              <div className="text-xs text-muted-foreground leading-tight">Управление этапами и шагами</div>
            </div>
          </div>
          <div className="hidden sm:flex items-center gap-2 text-xs bg-brand-light text-brand-dark px-3 py-1.5 rounded-full font-medium">
            <Icon name="ListChecks" size={14} />
            {stages.length} этапов · {totalSteps} шагов
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-10">
        <div className="mb-8 animate-fade-in">
          <h1 className="text-3xl font-bold tracking-tight mb-2">Этапы сотрудничества</h1>
          <p className="text-muted-foreground">
            Раскройте этап, чтобы посмотреть шаги. Наведите на шаг и нажмите «Изменить», чтобы отредактировать текст.
          </p>
        </div>

        <div className="space-y-3">
          {stages.map((stage, index) => {
            const isOpen = openStage === stage.id;
            return (
              <div
                key={stage.id}
                className="rounded-xl border border-border bg-card overflow-hidden transition-shadow hover:shadow-sm animate-fade-in"
                style={{ animationDelay: `${index * 40}ms` }}
              >
                <button
                  onClick={() => setOpenStage(isOpen ? null : stage.id)}
                  className="w-full flex items-center gap-4 px-5 py-4 text-left"
                >
                  <span className="h-8 w-8 shrink-0 rounded-lg bg-brand-light text-brand-dark flex items-center justify-center text-sm font-bold">
                    {index + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs uppercase tracking-wide text-muted-foreground">Этап {index + 1}</div>
                    <div className="font-semibold truncate">{stage.title}</div>
                  </div>
                  <span className="text-xs text-muted-foreground tabular-nums hidden sm:block">
                    {stage.steps.length} шагов
                  </span>
                  <Icon
                    name="ChevronDown"
                    size={20}
                    className={`shrink-0 text-muted-foreground transition-transform ${isOpen ? 'rotate-180' : ''}`}
                  />
                </button>

                {isOpen && (
                  <div className="border-t border-border bg-secondary/30">
                    <ul className="divide-y divide-border">
                      {stage.steps.map((step, si) => {
                        const isEditing = editing?.stepId === step.id;
                        return (
                          <li key={step.id} className="group flex items-center gap-3 px-5 py-3">
                            <span className="h-6 w-6 shrink-0 rounded-full border border-border bg-white text-xs flex items-center justify-center text-muted-foreground tabular-nums">
                              {si + 1}
                            </span>
                            {isEditing ? (
                              <div className="flex-1 flex items-center gap-2">
                                <input
                                  autoFocus
                                  value={draft}
                                  onChange={(e) => setDraft(e.target.value)}
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') saveEdit();
                                    if (e.key === 'Escape') setEditing(null);
                                  }}
                                  className="flex-1 rounded-md border border-brand bg-white px-3 py-1.5 text-sm outline-none ring-2 ring-brand/20"
                                />
                                <button
                                  onClick={saveEdit}
                                  className="h-8 px-3 rounded-md bg-brand text-white text-sm font-medium flex items-center gap-1 hover:bg-brand-dark transition-colors"
                                >
                                  <Icon name="Check" size={14} />
                                  Сохранить
                                </button>
                                <button
                                  onClick={() => setEditing(null)}
                                  className="h-8 w-8 rounded-md text-muted-foreground hover:bg-secondary flex items-center justify-center"
                                >
                                  <Icon name="X" size={16} />
                                </button>
                              </div>
                            ) : (
                              <>
                                <span className="flex-1 text-sm">{step.text}</span>
                                <button
                                  onClick={() => startEdit(stage.id, step)}
                                  className="opacity-0 group-hover:opacity-100 transition-opacity h-8 px-3 rounded-md text-brand-dark hover:bg-brand-light text-sm font-medium flex items-center gap-1.5"
                                >
                                  <Icon name="Pencil" size={14} />
                                  Изменить
                                </button>
                              </>
                            )}
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
}