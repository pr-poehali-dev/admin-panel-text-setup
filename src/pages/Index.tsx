import { useState, useEffect, useRef } from 'react';
import Icon from '@/components/ui/icon';

const UPLOAD_URL = 'https://functions.poehali.dev/0d13df32-74eb-4cdf-8844-5e82da6b0e28';
const GET_DOCS_URL = 'https://functions.poehali.dev/215039c3-ec61-479e-8c56-986f1625b805';

const STEP_DOCS: Record<string, string[]> = {
  's1-1': [
    'Агентский договор (АгД)',
    'Договор коммерческой концессии (ДКК)',
    'Договор поставки',
    'Соглашение о намерении (СоН)',
    'Соглашение о конфиденциальной информации (NDA)',
  ],
};

interface DocFile {
  id: number;
  step_id: string;
  doc_label: string;
  file_name: string;
  file_url: string;
}

interface Step {
  id: string;
  text: string;
  note: string;
  noteLabel?: string;
}

interface Stage {
  id: string;
  title: string;
  steps: Step[];
}

const makeSteps = (texts: string[], prefix: string): Step[] =>
  texts.map((text, i) => ({ id: `${prefix}-${i}`, text, note: '' }));

const stepLabels: Record<string, string> = {
  's1-0': 'Звонок менеджера',
  's1-1': 'Ознакомление с шаблонами документов',
  's1-2': 'Предоставление данных о локации',
  's1-3': 'Оценки экономики',
  's1-4': 'Оценки экономики',
  's1-5': 'Анкета партнера',
  's1-6': 'Подготовка СоН',
  's1-7': 'Обеспечительный платеж по соглашению о намерении',
};

const initialStages: Stage[] = [
  {
    id: 's1',
    title: 'Определение условий сотрудничества',
    steps: makeSteps([
      'Дождитесь звонок менеджера',
      'Ознакомьтесь с типовыми документами',
      'Предоставьте информацию о локации',
      'Ожидание оценки экономики',
      'Ознакомьтесь с оценкой экономики',
      'Заполните анкету',
      'Подписание документов',
      'Обеспечительный платеж',
    ], 's1'),
  },
  {
    id: 's2',
    title: 'Подбор локации',
    steps: makeSteps([
      'Подбор локаций',
      'Выбор Локации',
    ], 's2'),
  },
  {
    id: 's3',
    title: 'Защита на ИК',
    steps: makeSteps([
      'Данные для ИК',
      'Подготовка к аудиту',
      'Проведение ИК',
    ], 's3'),
  },
  {
    id: 's4',
    title: 'Создание ЮЛ и подписание документов',
    steps: makeSteps([
      'Создайте Юр. лицо',
      'Получите ЭЦП',
      'На проверке',
      'Создание учетной записи Х5',
      'Подпишите ДКК',
      'Создайте обособленное подразделение',
      'Заключите договор аренды',
      'Согласуйте планировки с расстановкой оборудования',
    ], 's4'),
  },
  {
    id: 's5',
    title: 'Подготовка к проведению РСР',
    steps: makeSteps([
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
    ], 's5'),
  },
  {
    id: 's6',
    title: 'Найм и обучение персонала',
    steps: makeSteps([
      'Найм персонала',
      'Обучите персонал',
      'Получение доступа во внутренние системы ТС5',
    ], 's6'),
  },
  {
    id: 's7',
    title: 'Открытие и запуск товародвижения',
    steps: makeSteps([
      'Проведение РСР',
      'Запустите товародвижение',
      'Организация праздничного открытия',
      'Ознакомление и подписание оставшихся документов',
    ], 's7'),
  },
];

interface ModalState {
  stageId: string;
  stepId: string;
}

export default function Index() {
  const [stages, setStages] = useState<Stage[]>(initialStages);
  const [openStage, setOpenStage] = useState<string | null>('s1');
  const [editing, setEditing] = useState<{ stageId: string; stepId: string } | null>(null);
  const [draft, setDraft] = useState('');
  const [modal, setModal] = useState<ModalState | null>(null);
  const [noteDraft, setNoteDraft] = useState('');
  const [docs, setDocs] = useState<DocFile[]>([]);
  const [uploading, setUploading] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [activeDocLabel, setActiveDocLabel] = useState<string | null>(null);

  const totalSteps = stages.reduce((sum, s) => sum + s.steps.length, 0);

  const loadDocs = async (stepId: string) => {
    const res = await fetch(`${GET_DOCS_URL}?step_id=${stepId}`);
    const data = await res.json();
    setDocs(data);
  };

  const handleFileUpload = async (file: File, docLabel: string, stepId: string) => {
    setUploading(docLabel);
    const reader = new FileReader();
    reader.onload = async () => {
      const base64 = (reader.result as string).split(',')[1];
      await fetch(UPLOAD_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ step_id: stepId, doc_label: docLabel, file_name: file.name, file_data: base64 }),
      });
      await loadDocs(stepId);
      setUploading(null);
    };
    reader.readAsDataURL(file);
  };

  const handleDeleteDoc = async (docId: number, stepId: string) => {
    await fetch(GET_DOCS_URL, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: docId }),
    });
    await loadDocs(stepId);
  };

  useEffect(() => {
    if (modal) loadDocs(modal.stepId);
  }, [modal]);

  const startEdit = (stageId: string, step: Step, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditing({ stageId, stepId: step.id });
    setDraft(step.text);
  };

  const saveEdit = () => {
    if (!editing) return;
    setStages((prev) =>
      prev.map((stage) =>
        stage.id === editing.stageId
          ? { ...stage, steps: stage.steps.map((step) => step.id === editing.stepId ? { ...step, text: draft.trim() || step.text } : step) }
          : stage
      )
    );
    setEditing(null);
  };

  const openModal = (stageId: string, step: Step) => {
    setModal({ stageId, stepId: step.id });
    setNoteDraft(step.note);
  };

  const saveNote = () => {
    if (!modal) return;
    setStages((prev) =>
      prev.map((stage) =>
        stage.id === modal.stageId
          ? { ...stage, steps: stage.steps.map((step) => step.id === modal.stepId ? { ...step, note: noteDraft } : step) }
          : stage
      )
    );
    setModal(null);
  };

  const modalStep = modal
    ? stages.find(s => s.id === modal.stageId)?.steps.find(s => s.id === modal.stepId)
    : null;
  const modalStage = modal
    ? stages.find(s => s.id === modal.stageId)
    : null;

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
            Раскройте этап — нажмите на шаг, чтобы открыть его содержимое.
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
                          <li
                            key={step.id}
                            className={`group flex items-center gap-3 px-5 py-3 ${!isEditing ? 'cursor-pointer hover:bg-brand-light/50 transition-colors' : ''}`}
                            onClick={() => !isEditing && openModal(stage.id, step)}
                          >
                            <span className="h-6 w-6 shrink-0 rounded-full border border-border bg-white text-xs flex items-center justify-center text-muted-foreground tabular-nums">
                              {si + 1}
                            </span>
                            {isEditing ? (
                              <div className="flex-1 flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
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
                                {step.note && (
                                  <Icon name="FileText" size={13} className="text-brand shrink-0" />
                                )}
                                <button
                                  onClick={(e) => startEdit(stage.id, step, e)}
                                  className="opacity-0 group-hover:opacity-100 transition-opacity h-7 px-2.5 rounded-md text-muted-foreground hover:bg-secondary text-xs font-medium flex items-center gap-1"
                                >
                                  <Icon name="Pencil" size={12} />
                                  Переименовать
                                </button>
                                <Icon name="ChevronRight" size={15} className="text-muted-foreground shrink-0 opacity-40 group-hover:opacity-100 transition-opacity" />
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

      {/* Modal */}
      {modal && modalStep && modalStage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
          onClick={() => setModal(null)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-xl mx-4 overflow-hidden animate-fade-in max-h-[90vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-6 pt-6 pb-4 border-b border-border shrink-0">
              <div className="text-xs text-muted-foreground mb-1">{modalStage.title}</div>
              <h2 className="text-lg font-semibold leading-snug">{modalStep.text}</h2>
            </div>

            <div className="overflow-y-auto flex-1">
              <div className="px-6 py-5">
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide block mb-2">
                  {stepLabels[modalStep.id] ?? 'Описание / инструкция'}
                </label>
                <textarea
                  value={noteDraft}
                  onChange={(e) => setNoteDraft(e.target.value)}
                  placeholder="Введите описание, инструкцию или заметку к этому шагу..."
                  rows={4}
                  className="w-full rounded-xl border border-border bg-secondary/40 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand resize-none transition-all"
                />
              </div>

              {STEP_DOCS[modalStep.id] && (
                <div className="px-6 pb-5">
                  <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-3">Документы</div>
                  <div className="space-y-2">
                    {STEP_DOCS[modalStep.id].map((label) => {
                      const uploaded = docs.filter(d => d.doc_label === label);
                      const isUploading = uploading === label;
                      return (
                        <div key={label} className="rounded-xl border border-border bg-secondary/30 px-4 py-3">
                          <div className="text-sm font-medium mb-2">{label}</div>
                          {uploaded.length > 0 && (
                            <div className="space-y-1 mb-2">
                              {uploaded.map(doc => (
                                <div key={doc.id} className="flex items-center gap-2 text-xs">
                                  <Icon name="FileText" size={13} className="text-brand shrink-0" />
                                  <a href={doc.file_url} target="_blank" rel="noreferrer" className="text-brand hover:underline truncate flex-1">{doc.file_name}</a>
                                  <button onClick={() => handleDeleteDoc(doc.id, modalStep.id)} className="text-muted-foreground hover:text-destructive transition-colors">
                                    <Icon name="Trash2" size={13} />
                                  </button>
                                </div>
                              ))}
                            </div>
                          )}
                          <button
                            disabled={isUploading}
                            onClick={() => { setActiveDocLabel(label); fileInputRef.current?.click(); }}
                            className="flex items-center gap-1.5 text-xs text-brand hover:text-brand-dark font-medium disabled:opacity-50 transition-colors"
                          >
                            <Icon name={isUploading ? 'Loader2' : 'Upload'} size={13} className={isUploading ? 'animate-spin' : ''} />
                            {isUploading ? 'Загружается...' : 'Загрузить файл'}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file && activeDocLabel && modal) {
                        handleFileUpload(file, activeDocLabel, modal.stepId);
                        e.target.value = '';
                      }
                    }}
                  />
                </div>
              )}
            </div>

            <div className="px-6 py-4 border-t border-border flex items-center justify-end gap-2 shrink-0">
              <button
                onClick={() => setModal(null)}
                className="h-9 px-4 rounded-lg text-sm text-muted-foreground hover:bg-secondary transition-colors"
              >
                Отмена
              </button>
              <button
                onClick={saveNote}
                className="h-9 px-5 rounded-lg bg-brand text-white text-sm font-medium hover:bg-brand-dark transition-colors flex items-center gap-1.5"
              >
                <Icon name="Check" size={15} />
                Сохранить
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}