import { fetchAgentDetails, saveAgentDetails, getCurrentAgentId, fetchPhoneNumbers, getSelectedPhoneNumber } from "@/actions/agent.actions";
import { getEmmaGlobalEnabled } from "@/actions/chat.actions";
import { CheckCircle2, Mic, Settings2, PhoneCall } from "lucide-react";
import PhoneNumberSelector from "@/components/PhoneNumberSelector";
import EmmaGlobalSwitch from "@/components/EmmaGlobalSwitch";

export const dynamic = 'force-dynamic';

export default async function AgentSettingsPage() {
  const agentDetails = await fetchAgentDetails();
  const phoneNumbers = await fetchPhoneNumbers();
  const currentPhoneNumberId = await getSelectedPhoneNumber();
  const globalEmma = await getEmmaGlobalEnabled();

  const messengerSwitch = (
    <EmmaGlobalSwitch initialEnabled={globalEmma.enabled !== false} />
  );

  if (!agentDetails) {
    return (
      <div className="max-w-[950px] mx-auto pt-6 pb-12 space-y-6">
        {messengerSwitch}
        <div className="p-12 text-center bg-white rounded-2xl shadow-sm border border-slate-200">
          <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <Settings2 size={32} />
          </div>
          <h2 className="text-xl font-bold text-slate-800">Agent Configuration Unavailable</h2>
          <p className="text-slate-500 mt-2 font-medium">Could not fetch agent details from ElevenLabs. Please verify your <code>AGENT_ID</code> and API key in the <code>.env</code> file.</p>
        </div>
      </div>
    );
  }

  const agentId = await getCurrentAgentId() || 'Not Configured';
  const agentConfig = agentDetails.conversation_config?.agent || {};
  const ttsConfig = agentDetails.conversation_config?.tts || {};
  const prompt = agentConfig.prompt?.prompt || '';
  const firstMessage = agentConfig.first_message || '';
  const llm = agentConfig.prompt?.llm || 'gpt-5.6-sol';
  const temperature = agentConfig.prompt?.temperature ?? 0.55;
  const voiceId = ttsConfig.voice_id || '';
  const ttsModelId = ttsConfig.model_id || 'eleven_v3_conversational';

  return (
    <div className="max-w-[950px] mx-auto pt-4 pb-12 space-y-6">
      {messengerSwitch}
      <div className="bg-white rounded-2xl shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] border border-slate-200 overflow-hidden">
        
        {/* Header Section */}
        <div className="px-8 py-6 border-b border-slate-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h3 className="text-xl font-extrabold text-slate-900">3knot Voice Agent Configuration</h3>
            <span className="text-[0.85rem] text-slate-500 mt-1 inline-block font-medium">
              Agent ID: <code className="bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded ml-1">{agentId}</code>
            </span>
          </div>
          <div className="flex items-center gap-3">
            {llm && (
              <span className="px-3 py-1 bg-indigo-50 text-indigo-700 font-mono text-[0.8rem] font-bold rounded-full">
                LLM: {llm}
              </span>
            )}
            <span className="px-3 py-1 bg-emerald-50 text-emerald-700 text-[0.8rem] font-bold rounded-full flex items-center gap-1.5">
              <CheckCircle2 size={14} />
              ElevenLabs API Connected
            </span>
          </div>
        </div>

        {/* Form Section */}
        <form suppressHydrationWarning action={saveAgentDetails} className="p-8 space-y-8">
          
          {/* 1. General Settings */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label htmlFor="name" className="block text-[0.85rem] font-bold text-slate-700">Agent Name</label>
              <input type="text" id="name" name="name" defaultValue={agentDetails.name || ''} required className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all text-[0.95rem] text-slate-900 font-medium" />
            </div>

            <div className="space-y-2">
              <label htmlFor="phoneNumber" className="block text-[0.85rem] font-bold text-slate-700 flex items-center gap-2">
                <PhoneCall size={14} className="text-indigo-600" />
                Active Outbound Phone Number
              </label>
              <PhoneNumberSelector phoneNumbers={phoneNumbers} currentPhoneNumberId={currentPhoneNumberId} />
              <p className="text-[0.75rem] text-slate-500 font-medium mt-1">This number will be used for manual and batch outbound calls.</p>
            </div>

            <div className="space-y-2">
              <label htmlFor="llm" className="block text-[0.85rem] font-bold text-slate-700">AI Language Model (LLM)</label>
              <select id="llm" name="llm" defaultValue={llm} className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all text-[0.95rem] text-slate-900 font-medium bg-white appearance-none">
                <option value="gpt-5.6-sol">GPT-5.6 Sol (Default Configured)</option>
                <option value="gpt-4o">OpenAI GPT-4o (High Reasoning & Intelligence)</option>
                <option value="gpt-4o-mini">OpenAI GPT-4o Mini (Fast & Cost Efficient)</option>
                <option value="claude-3-5-sonnet">Anthropic Claude 3.5 Sonnet (Natural Conversational Tone)</option>
                <option value="gemini-2.0-flash">Google Gemini 2.0 Flash (Ultra-low Latency)</option>
                <option value="gemini-1.5-flash">Google Gemini 1.5 Flash (Fast Speed)</option>
                <option value="gemini-1.5-pro">Google Gemini 1.5 Pro (Deep Context Window)</option>
                {/* Fallback for custom LLMs */}
                {!['gpt-5.6-sol', 'gpt-4o', 'gpt-4o-mini', 'claude-3-5-sonnet', 'gemini-2.0-flash', 'gemini-1.5-flash', 'gemini-1.5-pro'].includes(llm) && (
                  <option value={llm}>Custom: {llm}</option>
                )}
              </select>
              <p className="text-[0.75rem] text-slate-500 font-medium mt-1">Switches the backend intelligence model for live agent phone calls.</p>
            </div>
          </div>

          {/* 2. Voice & Speech Synthesis Settings */}
          <div className="bg-slate-50 border border-slate-200 p-6 rounded-2xl">
            <h4 className="text-[0.95rem] font-extrabold text-slate-800 mb-5 flex items-center gap-2">
              <Mic size={18} className="text-indigo-600" />
              Voice Synthesis & Speech Engine
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <label htmlFor="voice_id" className="block text-[0.85rem] font-bold text-slate-700">Voice ID</label>
                <input type="text" id="voice_id" name="voice_id" defaultValue={voiceId} placeholder="e.g. T720RsqorTx4ZZWohrNN" className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all text-[0.95rem] text-slate-900 font-mono bg-white" />
                <p className="text-[0.75rem] text-slate-500 font-medium">ElevenLabs Voice ID for output audio.</p>
              </div>

              <div className="space-y-2">
                <label htmlFor="tts_model_id" className="block text-[0.85rem] font-bold text-slate-700">TTS Engine Model</label>
                <select id="tts_model_id" name="tts_model_id" defaultValue={ttsModelId} className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all text-[0.95rem] text-slate-900 font-medium bg-white appearance-none">
                  <option value="eleven_v3_conversational">eleven_v3_conversational (Recommended)</option>
                  <option value="eleven_turbo_v2_5">eleven_turbo_v2_5 (Low Latency)</option>
                  <option value="eleven_multilingual_v2">eleven_multilingual_v2 (Multi-language)</option>
                </select>
              </div>

              <div className="space-y-2">
                <label htmlFor="temperature" className="block text-[0.85rem] font-bold text-slate-700">Creativity / Temperature</label>
                <input type="number" step="any" min="0" max="1" id="temperature" name="temperature" defaultValue={temperature} className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all text-[0.95rem] text-slate-900 font-medium bg-white" />
                <p className="text-[0.75rem] text-slate-500 font-medium">Range: 0 to 1 (Default: 0.55)</p>
              </div>
            </div>
          </div>

          {/* 3. Conversational Content */}
          <div className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="first_message" className="block text-[0.85rem] font-bold text-slate-700">First Message (Greeting Sentence)</label>
              <input type="text" id="first_message" name="first_message" defaultValue={firstMessage} placeholder="Hi, is this Irashad? This is Emma..." className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all text-[0.95rem] text-slate-900 font-medium" />
              <p className="text-[0.75rem] text-slate-500 font-medium">The initial greeting phrase spoken by the AI voice agent when the recipient picks up.</p>
            </div>

            <div className="space-y-2">
              <label htmlFor="prompt" className="block text-[0.85rem] font-bold text-slate-700">System Prompt / Agent Instructions</label>
              <textarea id="prompt" name="prompt" defaultValue={prompt} rows={12} placeholder="Define the AI persona, rules, objective, and instructions..." className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all resize-none text-[0.85rem] text-slate-900 font-mono leading-relaxed bg-slate-50"></textarea>
              <p className="text-[0.75rem] text-slate-500 font-medium">System instructions detailing personality, tone, goals, guardrails, and conversation flow.</p>
            </div>
          </div>

          <div className="pt-6 flex justify-end border-t border-slate-100">
            <button type="submit" className="px-6 py-3 bg-indigo-600 text-white rounded-xl text-[0.9rem] font-bold hover:bg-indigo-700 transition-all shadow-[0_2px_8px_rgba(79,70,229,0.25)] hover:-translate-y-px inline-flex items-center gap-2">
              <CheckCircle2 size={18} />
              Save & Sync Settings via API
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
