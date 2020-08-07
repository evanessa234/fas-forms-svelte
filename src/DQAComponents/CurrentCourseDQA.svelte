<script>
  // import marked from 'marked';
  let feedback = {
    labCourse: false,//newwww no need to include in db
    bTLevel: 5,
    grammar: null,
    commentCO: "",
    properDistriMap: null,
    commentMap: "",
    syllabusCoverage: null,
    coWeightage: null,
    chapOrExpWeightage: null,
    commentWeightage: "",
    typeOfExp: "",
    timeLimitJustified: "",
    modernToolUsed: null,
    outOfSyllabus: null,
    coCoverageAssMethod: null,
    marksDistri: null,
    questionQuality: "",
    commentAssMethod: "",
    submit: null
  };


  function handleSubmit() {
    alert(`Successfully Submitted`);
  }
</script>

<style>
  textarea {
    width: 50%;
    height: 100px;
  }
</style>

<form on:submit|preventDefault={handleSubmit}>
  <div><h4>Please check on course type before proceeding....</h4>
    <label>
      <input type="radio" bind:group={feedback.labCourse} value= {true} />
      Lab course 
    </label>
    <label>
      <input type="radio" bind:group={feedback.labCourse} value= {false} />
      Class course 
    </label>
   </div>
  <hr />
  <div>
    <h4>CO PO an PSO feedback</h4>
    <label>
      <b>Satisfied with BT level?</b>
      <input type="radio" bind:group={feedback.bTLevel} value={1} />
      yes
      <input type="radio" bind:group={feedback.bTLevel} value={0} />
      no
    </label>
    <label>
      <b>Satisfied with the grammar?</b>
      <input type="radio" bind:group={feedback.grammar} value={1} />
      yes
      <input type="radio" bind:group={feedback.grammar} value={0} />
      no
    </label>
    <label>
      <b>Any Suggestion?</b>
    </label>
    <textarea
      bind:value={feedback.commentCO}
      placeholder="Drop suggestions or corrections here" />

   </div>
  <hr />
  <div>
    <h4>CO-PO and CO-PSO mapping feedback</h4>
    <label>
      <b>Is CO-PO and CO-PSO mapping acceptable?</b>
      <input type="radio" bind:group={feedback.properDistriMap} value={1} />
      yes
      <input type="radio" bind:group={feedback.properDistriMap} value={0} />
      no
    </label>
    <label>
      <b>Any Suggestion?</b>
    </label>
    <textarea
      bind:value={feedback.commentMap}
      placeholder="Drop suggestions or corrections here" />
    </div>
  <hr />
  <div>
    {#if feedback.labCourse}
      <div><h4> CO Weightage</h4>
        <label><b> Satisfied with CO weightage distribution?</b>
          <input type="radio" bind:group={feedback.properDistriMap} value={1} />
            yes
          <input type="radio" bind:group={feedback.properDistriMap} value={0} />
            no
        </label>       
        </div>
    {:else}
      <div><h4> CO Weightage and Chapter Plan</h4>
        <label><b> Satisfied with CO weightage distribution?</b>
          <input type="radio" bind:group={feedback.properDistriMap} value={1} />
            yes
          <input type="radio" bind:group={feedback.properDistriMap} value={0} />
            no
        </label>       
        </div>
    {/if}
    </div>
  <hr />  
  <div>
  {#if feedback.labCourse}
  <div><h4> Experiment List or Lab Plan</h4>
    <label>
      <b>Is syllabus covered on time?</b>
      <input type="radio" bind:group={feedback.syllabusCoverage} value={1} />
      yes
      <input type="radio" bind:group={feedback.syllabusCoverage} value={0} />
      no
    </label>
    <label>
      <b>Satisfied with experiment's weightage distribution ?</b>
      <input type="radio" bind:group={feedback.chapOrExpWeightage} value={1} />
      yes
      <input type="radio" bind:group={feedback.chapOrExpWeightage} value={0} />
      no 
    </label>
    <label>
      <b>Experiment type</b>
      <label>
          <input type="checkbox" bind:group={feedback.typeOfExp} value="Logical" />
            Logical
        </label>
        <label>
          <input type="checkbox" bind:group={feedback.typeOfExp} value="Application Oriented" />
            Application Oriented
        </label>
        <label>
          <input type="text" bind:value={feedback.typeOfExp} placeholder="Any other?" />
        </label>
    </label>
    <label>
      <b>Is time limit justified?</b>
      <input type="radio" bind:group={feedback.timeLimitJustified} value={1} />
      yes
      <input type="radio" bind:group={feedback.timeLimitJustified} value={0} />
      no
    </label>
    <label>
      <b>Modern tools used?</b>
      <input type="radio" bind:group={feedback.modernToolUsed} value={1} />
      yes
      <input type="radio" bind:group={feedback.modernToolUsed} value={0} />
      no
    </label>
    <label>
      <b>Contain topics out of syllabus?</b>
      <input type="radio" bind:group={feedback.outOfSyllabus} value={1} />
      yes
      <input type="radio" bind:group={feedback.outOfSyllabus} value={0} />
      no
    </label>
    <label>
      <b>Any Suggestion?</b>    
    </label>
    <textarea
      bind:value={feedback.commentWeightage}
      placeholder="Drop suggestions or corrections here" />    
    </div>  
  {:else} 
  <div><h4> Lesson Plan</h4>
    <label>
      <b>Is syllabus covered on time?</b>
      <input type="radio" bind:group={feedback.syllabusCoverage} value={1} />
      yes
      <input type="radio" bind:group={feedback.syllabusCoverage} value={0} />
      no
    </label>
    <label>
      <b>Satisfied with topic wise weightage distribution ?</b>
      <input type="radio" bind:group={feedback.chapOrExpWeightage} value={1} />
      yes
      <input type="radio" bind:group={feedback.chapOrExpWeightage} value={0} />
      no 
    </label>
    <label>
      <b>Modern tools used?</b>
      <input type="radio" bind:group={feedback.modernToolUsed} value={1} />
      yes
      <input type="radio" bind:group={feedback.modernToolUsed} value={0} />
      no
    </label>
    <label>
      <b>Is time limit justified?</b>
      <input type="radio" bind:group={feedback.timeLimitJustified} value={1} />
      yes
      <input type="radio" bind:group={feedback.timeLimitJustified} value={0} />
      no
    </label>
    <label>
      <b>Contain topics out of syllabus?</b>
      <input type="radio" bind:group={feedback.outOfSyllabus} value={1} />
      yes
      <input type="radio" bind:group={feedback.outOfSyllabus} value={0} />
      no
    </label>
    <label>
      <b>Any Suggestion?</b>    
    </label>
    <textarea
      bind:value={feedback.commentWeightage}
      placeholder="Drop suggestions or corrections here" /> 
    </div>
  {/if}
  </div>
  <hr />
  <div>
    <h4>Assessment of Course Outcomes</h4>
    <label>
      <b>Are all CO's covered?</b>
      <input type="radio" bind:group={feedback.coCoverageAssMethod} value={1} />
      yes
      <input type="radio" bind:group={feedback.coCoverageAssMethod} value={0} />
      no
      </label>
    <label>
      <b>Is marks distribution acceptable?</b>
      <input type="radio" bind:group={feedback.marksDistri} value={1} />
      yes
      <input type="radio" bind:group={feedback.marksDistri} value={0} />
      no
      </label>
    <label>
      <b>Question Quality</b>
      <label>
          <input type="checkbox" bind:group={feedback.questionQuality} value="Numerical" />
            Numerical
        </label>
        <label>
          <input type="checkbox" bind:group={feedback.questionQuality} value="Logical" />
            Logical
        </label>
        <label>
          <input type="checkbox" bind:group={feedback.questionQuality} value="Theory" />
            Theory
        </label>
        <input type="text" bind:value={feedback.questionQuality} placeholder="Any other?" />
        <!-- {JSON.stringify(feedback.questionQuality)} -->
     </label>
    <label>
      <b>Any Suggestion?</b>
      </label>
    <textarea
      bind:value={feedback.commentAssMethod}
      placeholder="Drop suggestions or corrections here" />
    </div>
  <hr />
  <button type="submit">Submit</button>
</form>
