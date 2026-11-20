import * as Crypto from 'expo-crypto';
import { Redirect, useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, View } from 'react-native';

import { AppText, Button, Card, OptionGroup, Screen, SectionTitle, TextField } from '../../components/ui';
import { useTutorials, type TutorialInput } from '../../data/TutorialsContext';
import { DIFFICULTIES, DIFFICULTY_INFO, type Difficulty, type TutorialStep } from '../../data/types';
import { useAuth } from '../../services/AuthContext';
import { useTheme } from '../../theme/SettingsContext';

/** Atalhos de apps comuns no Brasil. */
const APP_PRESETS: { name: string; packages: string }[] = [
  { name: 'Nenhum', packages: '' },
  { name: 'WhatsApp', packages: 'com.whatsapp, com.whatsapp.w4b' },
  { name: 'Telefone', packages: 'com.google.android.dialer, com.samsung.android.dialer' },
  { name: 'Configurações', packages: 'com.android.settings' },
  { name: 'Câmera', packages: 'com.google.android.GoogleCamera, com.sec.android.app.camera' },
  { name: 'YouTube', packages: 'com.google.android.youtube' },
  { name: 'Gov.br', packages: 'br.gov.meugovbr' },
];

const newStep = (): TutorialStep => ({ id: Crypto.randomUUID(), title: '', instruction: '', tip: '' });

export default function TutorialEditor() {
  const t = useTheme();
  const router = useRouter();
  const { isAdmin } = useAuth();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const { getById, create, update } = useTutorials();
  const existing = id ? getById(id) : undefined;

  const [title, setTitle] = useState(existing?.title ?? '');
  const [description, setDescription] = useState(existing?.description ?? '');
  const [emoji, setEmoji] = useState(existing?.emoji ?? '📱');
  const [category, setCategory] = useState(existing?.category ?? 'Celular');
  const [difficulty, setDifficulty] = useState<Difficulty>(existing?.difficulty ?? 'facil');
  const [appName, setAppName] = useState(existing?.targetApp?.name ?? '');
  const [packages, setPackages] = useState(existing?.targetApp?.packageNames.join(', ') ?? '');
  const [steps, setSteps] = useState<TutorialStep[]>(existing?.steps ?? [newStep()]);
  const [saving, setSaving] = useState(false);

  if (!isAdmin) return <Redirect href="/admin/login" />;

  const patchStep = (index: number, patch: Partial<TutorialStep>) =>
    setSteps((prev) => prev.map((s, i) => (i === index ? { ...s, ...patch } : s)));

  const moveStep = (index: number, delta: -1 | 1) =>
    setSteps((prev) => {
      const target = index + delta;
      if (target < 0 || target >= prev.length) return prev;
      const next = [...prev];
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });

  const removeStep = (index: number) => setSteps((prev) => prev.filter((_, i) => i !== index));

  const save = async () => {
    const cleanSteps = steps
      .map((s) => ({ ...s, title: s.title.trim(), instruction: s.instruction.trim(), tip: s.tip?.trim() || undefined }))
      .filter((s) => s.title || s.instruction);

    const problems: string[] = [];
    if (!title.trim()) problems.push('• Escreva um título.');
    if (cleanSteps.length === 0) problems.push('• Adicione pelo menos um passo.');
    if (cleanSteps.some((s) => !s.title || !s.instruction))
      problems.push('• Todo passo precisa de título e instrução.');
    if (problems.length) {
      Alert.alert('Falta pouco', problems.join('\n'));
      return;
    }

    const packageNames = packages
      .split(',')
      .map((p) => p.trim())
      .filter(Boolean);

    const input: TutorialInput = {
      title: title.trim(),
      description: description.trim(),
      emoji: emoji.trim() || '📱',
      category: category.trim() || 'Geral',
      difficulty,
      targetApp: packageNames.length ? { name: appName.trim() || 'Aplicativo', packageNames } : undefined,
      steps: cleanSteps,
    };

    setSaving(true);
    try {
      if (existing) await update(existing.id, input);
      else await create(input);
      router.back();
    } finally {
      setSaving(false);
    }
  };

  return (
    <Screen
      title={existing ? 'Editar tutorial' : 'Novo tutorial'}
      footer={<Button label={saving ? 'Salvando…' : 'Salvar tutorial'} icon="💾" disabled={saving} onPress={save} />}
    >
      <SectionTitle>Informações</SectionTitle>
      <TextField label="Título" value={title} onChangeText={setTitle} placeholder="Ex.: Pedir um táxi pelo app" />
      <TextField
        label="Descrição"
        value={description}
        onChangeText={setDescription}
        multiline
        style={{ minHeight: 100 }}
        placeholder="Explique em uma frase o que a pessoa vai aprender"
      />
      <View style={{ flexDirection: 'row', gap: t.spacing(1.5) }}>
        <View style={{ width: 120 }}>
          <TextField label="Ícone" value={emoji} onChangeText={setEmoji} maxLength={4} />
        </View>
        <View style={{ flex: 1 }}>
          <TextField label="Categoria" value={category} onChangeText={setCategory} placeholder="Ex.: Banco" />
        </View>
      </View>

      <SectionTitle>Dificuldade</SectionTitle>
      <OptionGroup<Difficulty>
        columns={3}
        value={difficulty}
        onChange={setDifficulty}
        options={DIFFICULTIES.map((d) => ({ value: d, title: DIFFICULTY_INFO[d].label }))}
      />

      <SectionTitle>Aplicativo que será aberto</SectionTitle>
      <AppText variant="small" muted>
        Ao começar, o Passo Certo abre este app e mostra os passos por cima dele. Deixe vazio para começar na
        tela inicial do celular.
      </AppText>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
        {APP_PRESETS.map((p) => (
          <Button
            key={p.name}
            label={p.name}
            compact
            variant={packages === p.packages ? 'primary' : 'ghost'}
            onPress={() => {
              setPackages(p.packages);
              setAppName(p.packages ? p.name : '');
            }}
          />
        ))}
      </View>
      <TextField label="Nome do app" value={appName} onChangeText={setAppName} placeholder="Ex.: WhatsApp" />
      <TextField
        label="Pacote(s) Android"
        hint="Separe por vírgula. O primeiro instalado será aberto."
        value={packages}
        onChangeText={setPackages}
        autoCapitalize="none"
        autoCorrect={false}
        placeholder="com.whatsapp"
      />

      <SectionTitle>Passos ({steps.length})</SectionTitle>
      {steps.map((step, i) => (
        <Card key={step.id} style={{ gap: t.spacing(1.5) }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <AppText variant="large" bold style={{ flex: 1 }}>
              Passo {i + 1}
            </AppText>
            <Button label="▲" compact variant="ghost" disabled={i === 0} onPress={() => moveStep(i, -1)} />
            <Button
              label="▼"
              compact
              variant="ghost"
              disabled={i === steps.length - 1}
              onPress={() => moveStep(i, 1)}
            />
            <Button label="🗑" compact variant="danger" onPress={() => removeStep(i)} />
          </View>
          <TextField
            label="Título do passo"
            value={step.title}
            onChangeText={(v) => patchStep(i, { title: v })}
            placeholder="Ex.: Toque no botão verde"
          />
          <TextField
            label="Instrução"
            value={step.instruction}
            onChangeText={(v) => patchStep(i, { instruction: v })}
            multiline
            style={{ minHeight: 110 }}
            placeholder="Explique com calma o que fazer e onde fica"
          />
          <TextField
            label="Dica (opcional)"
            value={step.tip ?? ''}
            onChangeText={(v) => patchStep(i, { tip: v })}
            multiline
            placeholder="Ex.: aviso de segurança"
          />
        </Card>
      ))}
      <Button label="Adicionar passo" icon="＋" variant="secondary" onPress={() => setSteps((p) => [...p, newStep()])} />
    </Screen>
  );
}
