const crypto = require('crypto')

class Job {
    constructor(id, task, data, status, createdAt, updatedAt) {
      this.id = id;
      this.task = task;
      this.data = data;
      this.status = status || 'created';
      this.createdAt = createdAt || new Date();
      this.updatedAt = updatedAt || null;
      
    }

    get() {
        console.log(this)
    }
}

class JobFactory {

    #pub;

    constructor(publisher) {
        this.#pub = {
            publisher: publisher, 
            publish : function(i,f){console.log(this.publisher, i, f)}};
    }


    #fromOther(job) {
        return new Job (
            job.id,
            job.task,
            job.data,
            job.status,
            job.createdAt,
            job.updatedAt
  
            )
    }

    create(task, data) {
        let job = new Job(
            crypto.randomUUID(),
            task,
            data
            )
        
        job.get();
        return job;
    }

    
    markAsQueued(job) {
        job = this.#fromOther(job);
        job.status = 'queued';
        job.updatedAt = new Date();
        job.get();
        return job;
    }


    markAsComplete(job) {
        job = this.#fromOther(job);
        job.status = 'complete';
        job.updatedAt = new Date();
        job.get();
        return job;
    }

    markAsFailed(job) {
        job = this.#fromOther(job);
        job.status = 'failed';
        job.updatedAt = new Date();
        job.get();
        return job;
    }

    markAsStarted(job) {
        job = this.#fromOther(job);
        job.status = 'started';
        job.updatedAt = new Date();
        job.get();
        this.#pub.publish(job.id, job.status);
        return job;
    }

    start(job) {

        job = this.markAsStarted(job);
        return job;
        

    }



}

let factory = new JobFactory(5);

job = factory.create("FirstVisit", {profileUrl: "https://linkedin.com"});
job = factory.start(job);
job = factory.markAsComplete(job);



