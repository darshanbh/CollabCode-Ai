import { useEffect, useRef } from 'react'
import * as monaco from 'monaco-editor'
import { socket } from '../socket'

function Editor({ roomId, userId, userName }) {

    const editorRef = useRef(null)

    useEffect(() => {

        // Initialize Monaco Editor
        const editor = monaco.editor.create(
            document.getElementById('editor'), {
            language: 'python',
            theme: 'vs-dark'
        })

        editorRef.current = editor

        // THIS IS WHERE KEYSTROKE RECORDING HAPPENS
        editor.onDidChangeModelContent((event) => {

            const change = event.changes[0]

            // Build keystroke record
            const keystrokeData = {
                userId: userId,
                userName: userName,
                roomId: roomId,
                character: change.text,        // what was typed
                position: {
                    line: change.range.startLineNumber,
                    column: change.range.startColumn
                },
                fullCode: editor.getValue(),   // full code snapshot
                timestamp: Date.now(),         // exact millisecond
                isDelete: change.text === ''   // backspace detection
            }

            // Send to server via Socket.IO
            socket.emit('keystroke', keystrokeData)
        })

    }, [])

    return <div id="editor" style={{ height: '100vh' }} />
}

export default Editor