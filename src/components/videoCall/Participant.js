import Button from 'components/shared/Forms/Button'
import React, { useState, useEffect, useRef } from 'react'

import { FiMic, FiMicOff } from 'react-icons/fi'

const Participant = ({ participant }) => {
  const [videoTracks, setVideoTracks] = useState([])
  const [audioTracks, setAudioTracks] = useState([])
  const [muteAudio, setMuteAudio] = useState(true)

  const videoRef = useRef()
  const audioRef = useRef()

  const trackpubsToTracks = (trackMap) =>
    Array.from(trackMap.values())
      .map((publication) => publication.track)
      .filter((track) => track !== null)

  useEffect(() => {
    setVideoTracks(trackpubsToTracks(participant.videoTracks))
    setAudioTracks(trackpubsToTracks(participant.audioTracks))

    const trackSubscribed = (track) => {
      if (track.kind === 'video') {
        setVideoTracks((videoTracks) => [...videoTracks, track])
      } else if (track.kind === 'audio') {
        setAudioTracks((audioTracks) => [...audioTracks, track])
      }
    }

    const trackUnsubscribed = (track) => {
      if (track.kind === 'video') {
        setVideoTracks((videoTracks) => videoTracks.filter((v) => v !== track))
      } else if (track.kind === 'audio') {
        setAudioTracks((audioTracks) => audioTracks.filter((a) => a !== track))
      }
    }

    participant.on('trackSubscribed', trackSubscribed)
    participant.on('trackUnsubscribed', trackUnsubscribed)

    return () => {
      setVideoTracks([])
      setAudioTracks([])
      participant.removeAllListeners()
    }
  }, [participant])

  useEffect(() => {
    const videoTrack = videoTracks[0]
    if (videoTrack) {
      videoTrack.attach(videoRef.current)
      return () => {
        videoTrack.detach()
      }
    }
  }, [videoTracks])

  useEffect(() => {
    const audioTrack = audioTracks[0]
    if (audioTrack) {
      audioTrack.attach(audioRef.current)
      return () => {
        audioTrack.detach()
      }
    }
  }, [audioTracks])

  // const handleMuteAudio = () => {
  //   setMuteAudio(!muteAudio)
  //   console.log('Muting')
  //   if (videoRef.current) {
  //     videoRef.current.muted = muteAudio
  //     videoRef.current.defaultMuted = muteAudio
  //   }
  //   console.log(videoRef.current)
  // }

  return (
    <div className='participant'>
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <h3>{participant.identity}</h3>
        <video ref={videoRef} autoPlay={true} />
        <audio ref={audioRef} autoPlay={true} />
        {/* <audio ref={audioRef} autoPlay={true} muted={muteAudio} /> */}
        {/* <div onClick={handleMuteAudio}>
          {muteAudio ? (
            <FiMic className='call-icons' />
          ) : (
            <FiMicOff className='call-icons' />
          )}
        </div> */}
      </div>
    </div>
  )
}

export default Participant
