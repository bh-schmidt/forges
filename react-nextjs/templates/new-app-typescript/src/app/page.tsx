{% if template == 'electron' -%}
'use client'

import { getUsers } from "@/ipcs/users/getUsers";
import { useEffect } from "react";

{% endif -%}

export default function Home() {
{%- if template == 'electron' %}
    useEffect(() => {
        getUsers()
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
