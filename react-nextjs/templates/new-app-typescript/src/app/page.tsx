{% if template == 'electron' -%}
'use client'

import { ipc } from "@/common/ipc/ipc";
import { IpcChannels } from "@/common/ipc/IpcChannels";
import { useEffect } from "react";

{% endif -%}

export default function Home() {
{%- if template == 'electron' %}
    useEffect(() => {
        ipc.send<any[]>(IpcChannels.GetUsers)
            .then(users => {
                console.log('users', users)
            })
    }, [])
{% endif %}
    return (
        <div>
            <h1>Welcome to {{ projectName }}</h1>
        </div>
    );
}
