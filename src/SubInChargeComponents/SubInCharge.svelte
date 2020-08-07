<script>
  // import { v4 } from "uuid";

  let course = {
    labCourse: false, // #newww
    subInCharge: "", //from local stores #newww
    assistingTeachers: "", // will have to see later #newww
    fromAcadYr: 2020,
    toAcadYr: 2020,
    sem: 4,
    subjectCode: "",
    courseName: "",
    credits: 0,
    lectHr: 0,
    totLectHr: 0,
    practHr: 0,
    totPractHr: 0,
    objectives: [],
    courseOutcomes: [],
    courseTopics: [],
    co_poMapping: [],
    co_psoMapping: [],
    lessonPlan: [],
    progOutcomes: [],
    progSpecificOutcome: [],
    assessmentMethod: []
  };

// function for objectives
  let objChoices = ["Objective number", 1, 2, 3, 4, 5, 6, 7, 8, 9];

  const addObjective = () => {
    course.objectives = course.objectives.concat({
      // obj_id: v4(),
      obj_no: "",
      obj_description: ""
    });
  };

  // const delObjective = obj_id => {
  //   course.objectives = course.objectives.filter(obj => obj.obj_id !== obj_id);
  // };
  const delObjective = () => {
    course.objectives.splice(-1, 1);
    course.objectives = course.objectives;
  }

// funtions for course outcomes
  let coChoices = [
    "CO number",
    "CO1",
    "CO2",
    "CO3",
    "CO4",
    "CO5",
    "CO6",
    "CO7",
    "CO8",
    "CO9",
    "CO10"
  ];

  const addCO = () => {
    course.courseOutcomes = course.courseOutcomes.concat({
      // co_id: v4(),
      co_no: "",
      co_name: "",
      weightagePercent: 0,
      durationHr: 0,
      noOfExp: 0
    });
  };

  // const delCO = co_id => {
  //   course.courseOutcomes = course.courseOutcomes.filter(
  //     co => co.co_id !== co_id
  //   );
  // };
  const delCO = () => {
    course.courseOutcomes.splice(-1, 1);
    course.courseOutcomes = course.courseOutcomes;
  }
// functions for PO
  let poChoices = [
    "PO number",
    "PO1",
    "PO2",
    "PO3",
    "PO4",
    "PO5",
    "PO6",
    "PO7",
    "PO8",
    "PO9",
    "PO10",
    "PO11",
    "PO12",
    "PO13",
    "PO14",
    "PO15"
  ];

  const addPO = () => {
    course.progOutcomes = course.progOutcomes.concat({
      // po_id: v4(),
      po_no: "",
      po_title: "",
      po_description: ""
    });
  };

  // const delPO = po_id => {
  //   course.progOutcomes = course.progOutcomes.filter(po => po.po_id !== po_id);
  // };
  const delPO = () => {
    course.progOutcomes.splice(-1, 1);
    course.progOutcomes = course.progOutcomes;
  }

// functions for PSO
  let psoChoices = [
    "PSO number",
    "PSO1",
    "PSO2",
    "PSO3",
    "PSO4",
    "PSO5",
    "PSO6",
    "PSO7",
    "PSO8",
    "PSO9",
    "PSO10"
  ];

  const addPSO = () => {
    course.progSpecificOutcome = course.progSpecificOutcome.concat({
      // pso_id: v4(),
      pso_no: "",
      pso_description: ""
    });
  };

  // const delPSO = pso_id => {
  //   course.progSpecificOutcome = course.progSpecificOutcome.filter(
  //     pso => pso.pso_id !== pso_id
  //   );
  // };

  const delPSO = () => {
    course.progSpecificOutcome.splice(-1, 1);
    course.progSpecificOutcome = course.progSpecificOutcome;
  }

// functions for CO-PO mappings and CO-PSO mappings
  let copso = [];
  let copo = [];

  let cos = ["CO1", "CO2", "CO3", "CO4", "CO5", "CO6", "CO7"];
  // let cos = course.courseOutcomes.map(co => co.co_no)
  let pos = ["PO1", "PO2", "PO3", "PO4", "PO5", "PO6", "PO7", "PO8", "PO9", "PO10", "PO11", "PO12"];
  // let pos = course.progOutcomes.map(po => po.po_no)
  let psos = ["PSO1", "PSO2", "PSO3", "PSO6", "PSO7", "PSO8", "PSO9"];
  // let psos = course.progSpecificOutcome.map(pso => pso.pso_no)

  for (var i = 0; i < cos.length; i++) {
    copo[i] = new Array(cos[0].length).fill();

    for (var j = 0; j < pos.length; j++) {
      copo[i][j] = {
        // co_po_id: v4(),
        co_no: cos[i],
        po_no: pos[j],
        rating: ""
      }; // Here is the fixed column access using the outter index i.
    }
  }

  const addco_po_mapping = () => {
    course.co_poMapping = [];
    for (var i = 0; i < cos.length; i++) {
      for (var j = 0; j < pos.length; j++) {
        if (copo[i][j].rating) {
          course.co_poMapping = course.co_poMapping.concat(copo[i][j]);
        }
      }
    }
  };

  for (var i = 0; i < cos.length; i++) {
    copso[i] = new Array(cos[0].length).fill();

    for (var j = 0; j < psos.length; j++) {
      copso[i][j] = {
        // id: v4(),
        co_no: cos[i],
        pso_no: psos[j],
        rating: ""
      };
    }
  }

  const addco_pso_mapping = () => {
    course.co_psoMapping = [];
    for (var i = 0; i < cos.length; i++) {
      for (var j = 0; j < psos.length; j++) {
        if (copso[i][j].rating) {
          course.co_psoMapping = course.co_psoMapping.concat(copso[i][j]);
        }
      }
    }
  };
// functions for Lesson plan
  let teachMethods = [
    "Method",
    "PPT",
    "NPTEL videos",
    "Case Study",
    "Group Discussion",
    "Smart Board",
    "Quiz",
    "Puzzle",
    "Others"
  ];

  const addLessonPlan = () => {
    course.lessonPlan = course.lessonPlan.concat({
      // id: v4(),
      weekNo: "",
      lectNo: "",
      subTopics: "",
      coMeet: "",
      weightage: "",
      teachingMethod: ""
    });
  };

  const delLessonPlan = () => {
    course.lessonPlan.splice(-1, 1);
    course.lessonPlan = course.lessonPlan;
  }
  // const delLessonPlan = id => {
  //   course.lessonPlan = course.lessonPlan.filter(plan => plan.id !== id);
  // };

// functions for Course Topics
  const addCourseTopic = () => {
    course.courseTopics = course.courseTopics.concat({
      // id: v4(),
      chp_expNo: "",
      chp_expTopic: "",
      coMeet: "",
      weightage: ""
    });
  };

  // const delCourseTopic = id => {
  //   course.courseTopics = course.courseTopics.filter(
  //     courseTopic => courseTopic.id !== id
  //   );
  // };

  const delCourseTopic = () => {
    course.courseTopics.splice(-1, 1);
    course.courseTopics = course.courseTopics;
  }

// functions for assessment method
  // for Term test
  let termTestArray = [];
  let termTestNo = ["Term Test 1", "Term Test 2"];
  let questionNos = [1, 2, 3];

  for (var i = 0; i < 2 * questionNos.length; i++) {
    termTestArray[i] = new Array(questionNos[0].length).fill();

    if (i < questionNos.length) {
      for (var j = 0; j < cos.length; j++) {
        termTestArray[i][j] = {
          assessMethod: termTestNo[0],
          Q_no: questionNos[i],
          co_meet: cos[j],
          marks: ""
        };
      }
    } else {
      for (var j = 0; j < cos.length; j++) {
        termTestArray[i][j] = {
          assessMethod: termTestNo[1],
          Q_no: questionNos[i - 3],
          co_meet: cos[j],
          marks: ""
        };
      }
    }
  }

  const addTermTest = () => {
    course.assessmentMethod = [];
    for (var i = 0; i < 2 * questionNos.length; i++) {
      for (var j = 0; j < cos.length; j++) {
        if (termTestArray[i][j].marks) {
          course.assessmentMethod = course.assessmentMethod.concat(
            termTestArray[i][j]
          );
        }
      }
    }
  };

  // for assignment
  let assNos = ["Assignment1", "Assignment2", "Assignment3"];
  let assignmentArray = [];

  for (var i = 0; i < assNos.length; i++) {
    assignmentArray[i] = new Array(assNos[0].length).fill();
    for (var j = 0; j < cos.length; j++) {
      assignmentArray[i][j] = {
        assessMethod: assNos[i],
        co_meet: cos[j],
        marks: ""
      };
    }
  }

  const addAssignment = () => {
    course.assessmentMethod = [];
    for (var i = 0; i < assNos.length; i++) {
      for (var j = 0; j < cos.length; j++) {
        if (assignmentArray[i][j].marks) {
          course.assessmentMethod = course.assessmentMethod.concat(
            assignmentArray[i][j]
          );
        }
      }
    }
  };

function handleSubmit() {
    alert(`Successfully Submitted`);
  }  
</script>

<style>
  main {
    text-align: center;
    padding: 1em;
    max-width: 240px;
    margin: 0 auto;
  }

  h1 {
    color: #ff3e00;
    text-transform: uppercase;
    font-size: 4em;
    font-weight: 100;
  }

  @media (min-width: 640px) {
    main {
      max-width: none;
    }
  }
</style>

<!-- remember to add submit function -->
<form on:submit|preventDefault>
  <!-- div for selecting type of course -->
  <div>
    <h4>Please check on course type before proceeding....</h4>
    <label>
      <input type="radio" bind:group={course.labCourse} value={true} />
      Lab course
    </label>
    <label>
      <input type="radio" bind:group={course.labCourse} value={false} />
      Class course
    </label>
    </div>
    <hr />
  <!-- div for course details -->
  <div>
    <h4>Enter course details...</h4>
    <label>
      Academic Year: from
      <input
        type="number"
        bind:value={course.fromAcadYr}
        min="2010"
        max="2060" />
      to
      <input type="number" bind:value={course.toAcadYr} min="2010" max="2060" />
      Semester
      <input type="number" bind:value={course.sem} min="1" max="8" />
    </label>
    <label>
      Subject Code:
      <input size = "2" bind:value={course.subjectCode} />
      Course Name:
      <input bind:value={course.courseName} />
    </label>
    <label>
      credits
      <input type="number" bind:value={course.credits} min="0" max="10" />
    </label>
    {#if !course.labCourse}
      <label>
        Lecture Hours
        <input type="number" bind:value={course.lectHr} min="0" max="10" />
        Total Contact Hours
        <input type="number" bind:value={course.totLectHr} min="0" max="60" />
      </label>
    {:else}
      <label>
        Practical hours per week
        <input type="number" bind:value={course.practHr} min="0" max="10" />
        Total Contact Hours
        <input type="number" bind:value={course.totPractHr} min="0" max="60" />
      </label>
    {/if}
    </div>
    <hr />
  <!-- div for course objectives-->
  <div>
    <h4>Enter course objectives...</h4>
    {#if course.objectives.length}
      <h4>Objective list..</h4>
      {#each course.objectives as obj, i}
        <row>
          <select bind:value={obj.obj_no}>
            {#each objChoices as objChoice}
              <option value={objChoice}>{objChoice}</option>
            {/each}
          </select>
          <input
            type="text"
            bind:value={obj.obj_description}
            placeholder="Objective description" />
          {#if i === course.objectives.length - 1}
            <button on:click={delObjective}>Delete</button>
          {/if}
        </row>
        <br />
      {/each}
    {:else}wait...{/if}
    <button on:click={addObjective}>Add new Objective</button>
    <br />
    {JSON.stringify(course.objectives)}
    </div>
    <hr />
  <!-- div for course outcomes -->
  <div>
    <h4>Enter course outcomes...</h4>
    {#if course.courseOutcomes.length}
      <h4>CO list..</h4>
      {#each course.courseOutcomes as co, i}
        <row>
          <select bind:value={co.co_no}>
            {#each coChoices as coChoice}
              <option value={coChoice}>{coChoice}</option>
            {/each}
          </select>
          <input
            type="text"
            bind:value={co.co_name}
            placeholder="Enter CO description" />
          weightage
          <input
            type="number"
            size="1"
            bind:value={co.weightagePercent}
            min="0"
            max="25" />

          {#if course.labCourse}
            total experiments
            <input type="number" bind:value={co.noOfExp} min="0" max="25" />
          {:else}
            duration
            <input
              type="number"
              size="1"
              bind:value={co.durationHr}
              min="0"
              max="25" />
          {/if}
          {#if i === course.courseOutcomes.length - 1}
            <button on:click={delCO}>Delete</button>
          {/if}
        </row>
        <br />
      {/each}
    {:else}wait...{/if}
    <button on:click={addCO}>Add new CO</button>
    <br />
    {JSON.stringify(course.courseOutcomes)}
    </div>
    <hr />
    
  <!-- div for PO -->
  <div>
    <h4>Enter program outcomes...</h4>
    {#if course.progOutcomes.length}
      <h4>PO list..</h4>
      {#each course.progOutcomes as po, i}
        <row>
          <select bind:value={po.po_no}>
            {#each poChoices as poChoice}
              <option value={poChoice}>{poChoice}</option>
            {/each}
          </select>
          <input
            type="text"
            bind:value={po.po_title}
            placeholder="Enter PO Title" />
          <input
            type="text"
            bind:value={po.po_description}
            placeholder="Enter PO description" />
          {#if i === course.progOutcomes.length - 1}
            <button on:click={delPO}>Delete</button>
          {/if}
        </row>
        <br />
      {/each}
    {:else}wait...{/if}
    <button on:click={addPO}>Add new PO</button>
    <br />
    {JSON.stringify(course.progOutcomes)}
    </div>
    <hr />
  <!-- div for co po map -->
  <div>
    <h4>Map CO with PO...</h4>
    {#each pos as po}
      <span style="margin-left: 27px;">{po}</span>
    {/each}
    <br />
    {#each cos as co, i}
      {co}
      {#each pos as po, j}
        <input type="text" size="1" bind:value={copo[i][j].rating} />
      {/each}
      <br />
    {/each}
    <button on:click={addco_po_mapping}>Save</button>
    //feature to add rating to 10 pending
    <br />
    {JSON.stringify(course.co_poMapping)};
    </div>
    <hr />

  <!--div for PSO  -->
  <div>
    <h4>Enter program specific outcomes...</h4>
    {#if course.progSpecificOutcome.length}
      <h4>PSO list..</h4>
      {#each course.progSpecificOutcome as pso, i}
        <row>
          <select bind:value={pso.pso_no}>
            {#each psoChoices as psoChoice}
              <option value={psoChoice}>{psoChoice}</option>
            {/each}
          </select>
          <input
            type="text"
            bind:value={pso.pso_description}
            placeholder="Enter PSO description" />
          {#if i === course.progSpecificOutcome.length - 1}
            <button on:click={delPSO}>Delete</button>
          {/if}
        </row>
        <br />
      {/each}
    {:else}wait...{/if}
    <button on:click={addPSO}>Add new PSO</button>
    <br />
    {JSON.stringify(course.progSpecificOutcome)}
    </div>
    <hr />
  <!-- div for co pso map -->
  <div>
    <h4>Map CO with PSO...</h4>
    {#each psos as pso}
      <span style="margin-left: 28px;">{pso}</span>
    {/each}
    <br />
    {#each cos as co, i}
      {co}
      {#each psos as pso, j}
        <input type="text" size="2" bind:value={copso[i][j].rating} />
      {/each}
      <br />
    {/each}

    <button on:click={addco_pso_mapping}>Save</button>
    <br />
    {JSON.stringify(course.co_psoMapping)};
    </div>
    <hr />
  <!-- div for Course Topics -->
  <div><h4>Course Topic</h4>
    {#if course.labCourse}EXPERIMENT LIST<br>{:else}CHAPTER PLAN<br>{/if}
    {#each course.courseTopics as courseTopic, i}
      <row>
        No.
        <input
          type="number"
          size = "1"
          bind:value={courseTopic.chp_expNo}
          min="0"
          max="25" />
        Topic  
        <input
          type="text"
          bind:value={courseTopic.chp_expTopic}
          placeholder="Enter Topic Name" />
          <select size = "1" bind:value={courseTopic.coMeet}>
          {#each coChoices as coChoice}
            <option value={coChoice}>{coChoice}</option>
          {/each}
        </select>
        weightage
        <input
          type="number"
          size = "1"
          bind:value={courseTopic.weightage}
          min="0"
          max="25" />
        {#if i === course.courseTopics.length - 1}
          <button on:click={delCourseTopic}>Delete</button>
        {/if}
      </row>
      <br>
    {/each}
    <button on:click={addCourseTopic}>Add new Topic</button>
    <br />
    {JSON.stringify(course.courseTopics)}
    </div>
    <hr />

  <!-- div for Lesson Plan -->
  {#if !course.labCourse}
    <div>
      <h4>Lesson Plan...</h4>
      {#each course.lessonPlan as plan, i}
        <row>
          <input
            size="2"
            type="text"
            bind:value={plan.weekNo}
            placeholder="week no" />
          <input
            size="2"
            type="text"
            bind:value={plan.lectNo}
            placeholder="lect no" />
          <input
            type="text"
            bind:value={plan.subTopics}
            placeholder="sub Topic" />
          <select bind:value={plan.coMeet}>
            {#each coChoices as coChoice}
              <option value={coChoice}>{coChoice}</option>
            {/each}
          </select>
          <input
            type="text"
            size="2"
            bind:value={plan.weightage}
            placeholder="weightage" />
          <select bind:value={plan.teachMethod}>
            {#each teachMethods as tm}
              <option value={tm}>{tm}</option>
            {/each}
          </select>
          {#if i === course.lessonPlan.length - 1}
            <button on:click={delLessonPlan}>Delete</button>
          {/if}
        </row>
        <br />
      {/each}
      <button on:click={addLessonPlan}>Add new row</button>
      <br />
      {JSON.stringify(course.lessonPlan)}
    </div>
    <hr />
  {/if}
  <!-- div for assessment method -->
  <div>
    <h4>Assessment method...</h4>
    {#if !course.labCourse}
      <div>
        <h4>Assessment Method (Term test)</h4>
        {termTestNo[0]}
        <br />
        {#each cos as co}
          <span style="margin-left: 30px;">{co}</span>
        {/each}
        <br />
        {#each questionNos as questionNo, i}
          Q{questionNo}
          {#each cos as co, j}
            <input
              type="text"
              size="1"
              bind:value={termTestArray[i][j].marks} />
          {/each}
          <br />
        {/each}
        {termTestNo[1]}
        <br />
        {#each cos as co}
          <span style="margin-left: 30px;">{co}</span>
        {/each}
        <br />
        {#each questionNos as questionNo, i}
          Q{questionNo}
          {#each cos as co, j}
            <input
              type="text"
              size="1"
              bind:value={termTestArray[i + 3][j].marks} />
          {/each}
          <br />
        {/each}
        <button on:click={addTermTest}>Save</button>
        <br />
      </div>
    {:else}
      <div>
        <span style="margin-left: 70px" />
        {#each cos as co}
          <span style="margin-left: 30px;">{co}</span>
        {/each}
        <br />
        {#each assNos as assNo, i}
          {assNo}
          {#each cos as co, j}
            <input
              type="text"
              size="1"
              bind:value={assignmentArray[i][j].marks} />
          {/each}
          <br />
        {/each}
        <button on:click={addAssignment}>Save</button>
        <br />
      </div>
    {/if}
    {JSON.stringify(course.assessmentMethod)}
    </div>
    <hr />
  <button type="submit" on:click = "{handleSubmit}">Submit</button>
</form>