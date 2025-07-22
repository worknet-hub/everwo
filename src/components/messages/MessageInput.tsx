import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send } from 'lucide-react';
import { useReactMediaRecorder } from 'react-media-recorder';
import { Mic, StopCircle, Camera } from 'lucide-react';
import React from 'react';
import { supabase } from '@/integrations/supabase/client';

interface MessageInputProps {
  newMessage: string;
  setNewMessage: (message: string) => void;
  onSendMessage: () => void;
  isConnected: boolean;
  onSendAudioMessage?: (audioUrl: string, audioBlob: Blob) => void;
}

export const MessageInput = ({ 
  newMessage, 
  setNewMessage, 
  onSendMessage, 
  isConnected,
  onSendAudioMessage
}: MessageInputProps) => {
  const {
    status,
    startRecording,
    stopRecording,
    mediaBlobUrl,
    clearBlobUrl,
    mediaBlob
  } = useReactMediaRecorder({ audio: true });

  // New state to control preview/send
  const [audioReady, setAudioReady] = React.useState(false);
  const [audioUrl, setAudioUrl] = React.useState<string | null>(null);
  const [audioBlob, setAudioBlob] = React.useState<Blob | null>(null);
  const [uploadingImage, setUploadingImage] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // When recording stops and we have a blob, allow preview
  React.useEffect(() => {
    if (mediaBlobUrl && mediaBlob) {
      setAudioUrl(mediaBlobUrl);
      setAudioBlob(mediaBlob);
      setAudioReady(true);
    }
  }, [mediaBlobUrl, mediaBlob]);

  // Workaround: fetch blob from URL if mediaBlob is missing but mediaBlobUrl is set
  React.useEffect(() => {
    if (mediaBlobUrl && !mediaBlob) {
      fetch(mediaBlobUrl)
        .then(res => res.blob())
        .then(blob => {
          setAudioBlob(blob);
          setAudioUrl(mediaBlobUrl);
          setAudioReady(true);
        });
    }
  }, [mediaBlobUrl, mediaBlob]);

  // Clear preview after sending or cancel
  const handleClearAudio = () => {
    setAudioReady(false);
    setAudioUrl(null);
    setAudioBlob(null);
    clearBlobUrl();
  };

  // Send audio when user clicks send
  const handleSendAudio = () => {
    if (audioUrl && audioBlob && onSendAudioMessage) {
      onSendAudioMessage(audioUrl, audioBlob);
      handleClearAudio();
    }
  };

  const handleCameraClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    setUploadingImage(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `chat_${Date.now()}.${fileExt}`;
      const filePath = `chat-media/${fileName}`;
      const { error: uploadError } = await supabase.storage.from('thought-media').upload(filePath, file, { upsert: true });
      if (uploadError) {
        setUploadingImage(false);
        alert('Failed to upload image');
        return;
      }
      const { data } = supabase.storage.from('thought-media').getPublicUrl(filePath);
      if (data?.publicUrl) {
        setNewMessage(data.publicUrl);
        onSendMessage();
      }
    } catch (err) {
      alert('Failed to upload image');
    } finally {
      setUploadingImage(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <div className="border-t mb-4 md:mb-0">
      <div className="flex space-x-2 items-center">
        <Input
          placeholder={isConnected ? "Type a message..." : "Connect with this user to send messages..."}
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && isConnected && onSendMessage()}
          className="flex-1 h-14 text-base py-3 bg-black/60 text-white placeholder-gray-400 rounded-full border-none outline-none focus:outline-none shadow-none"
          disabled={!isConnected || audioReady || uploadingImage}
        />
        {/* Camera icon for media upload */}
        <button
          type="button"
          onClick={handleCameraClick}
          disabled={!isConnected || uploadingImage}
          className="h-14 w-14 flex items-center justify-center rounded-full bg-black/60 backdrop-blur-md shadow-none outline-none focus:outline-none border-none"
          title="Send media"
        >
          {uploadingImage ? (
            <span className="loader w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
          ) : (
            <Camera className="h-5 w-5 text-white" />
          )}
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
          disabled={uploadingImage}
        />
        {/* Voice note button and preview */}
        {audioReady ? (
          <div className="flex items-center space-x-2">
            {audioUrl ? (
              <audio controls src={audioUrl || undefined} className="h-10" />
            ) : (
              <span className="text-red-500 text-xs">No audio available</span>
            )}
            <Button
              type="button"
              onClick={handleSendAudio}
              disabled={!isConnected}
              className="h-14 rounded-full bg-green-600 text-white"
            >
              <Send className="h-5 w-5" />
            </Button>
            <Button
              type="button"
              onClick={handleClearAudio}
              className="h-14 rounded-full bg-gray-600 text-white"
            >
              Cancel
            </Button>
          </div>
        ) : (
          <Button
            type="button"
            onClick={status === 'recording' ? stopRecording : startRecording}
            disabled={!isConnected}
            className={`h-14 rounded-full bg-black/60 backdrop-blur-md shadow-none outline-none focus:outline-none border-none flex items-center justify-center ${status === 'recording' ? 'animate-pulse' : ''}`}
          >
            {status === 'recording' ? <StopCircle className="h-5 w-5 text-red-500" /> : <Mic className="h-5 w-5 text-white" />}
          </Button>
        )}
        <Button onClick={onSendMessage} disabled={!isConnected || audioReady} className="h-14 rounded-full bg-black/60 backdrop-blur-md shadow-none outline-none focus:outline-none border-none">
          <Send className="h-5 w-5 text-white" />
        </Button>
      </div>
      {/* Fallback message if recording fails */}
      {audioReady && !audioUrl && (
        <div className="text-red-500 text-xs mt-2">Recording failed or no audio was captured. Please try again or check your microphone permissions.</div>
      )}
    </div>
  );
};
