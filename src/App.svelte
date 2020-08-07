<script>

import CurrentCourseDQA from "./DQAComponents/CurrentCourseDQA.svelte"
import SubInCharge from "./SubInChargeComponents/SubInCharge.svelte";
import Test from "./Test.svelte"

export let menu = 1;

</script>

<style>
    ul#menu li{
        display: inline;
    }
</style>

<ul id="menu">
    <li><a href="/" on:click|preventDefault={() => (menu = 1)}>SubInCharge</a></li> |
    <li><a href="/" on:click|preventDefault={() => (menu = 2)}>DQA</a></li> |
    <li><a href="/" on:click|preventDefault={() => (menu = 3)}>test</a></li>

</ul>
<hr/>
{#if menu === 1}
    <SubInCharge/>
{:else if menu === 2}
    <CurrentCourseDQA/>
{:else if menu === 3}
    <Test/>
{:else}
    <h1> 
        Page Not Found
    </h1>
{/if}