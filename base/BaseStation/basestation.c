#include <signal.h>
#include <stdlib.h>
#include <stdio.h>
#include <unistd.h>

#include <awa/common.h>
#include <awa/client.h>

#include <letmecreate/letmecreate.h>

#define OPERATION_PERFORM_TIMEOUT   (1000)

static AwaClientSession * session;

static volatile bool running = true;

static void exit_program(int __attribute__ ((unused))signo)
{
    running = false;
}

/* Definition of the Digital Output IPSO object */
static void DefineRelayObject(void)
{
    AwaObjectDefinition * objectDefinition = AwaObjectDefinition_New(3201, "Digital Output", 0, 1);
    AwaObjectDefinition_AddResourceDefinitionAsBoolean(objectDefinition, 5550, "Relay", false, AwaResourceOperations_ReadWrite, false);

    AwaClientDefineOperation * operation = AwaClientDefineOperation_New(session);
    AwaClientDefineOperation_Add(operation, objectDefinition);
    AwaClientDefineOperation_Perform(operation, OPERATION_PERFORM_TIMEOUT);
    AwaClientDefineOperation_Free(&operation);
}

/* Create LWM2M Instances and Resources */
static void SetInitialValues(void)
{
    AwaClientSetOperation * operation = AwaClientSetOperation_New(session);

    AwaClientSetOperation_CreateObjectInstance(operation, "/3201/0");
    AwaClientSetOperation_CreateOptionalResource(operation, "/3201/0/5550");

    AwaClientSetOperation_Perform(operation, OPERATION_PERFORM_TIMEOUT);
    AwaClientSetOperation_Free(&operation);
}

/* Callback funtion called when the resource changes */
static void ChangeCallback(const AwaChangeSet * changeSet, void * context)
{
    const bool * value;
    AwaChangeSet_GetValueAsBooleanPointer(changeSet, "/3201/0/5550", &value);
    led_set(ALL_LEDS, *value ? ALL_LEDS : 0); // Turn LEDs on/off based on current resource value
    if (*value)
        relay2_click_enable_relay(MIKROBUS_1, RELAY2_CLICK_RELAY_1); //Turn Relay on if resource is set to true
    else
        relay2_click_disable_relay(MIKROBUS_1, RELAY2_CLICK_RELAY_1); //Turn relay off if resource is not set to true
}

/* Ensure that the onboarding process has been completed by checking for a certificate */
static void certcheck()
{
    if(access("/etc/creator/endpoint.crt", F_OK ) != 0)
    {
        printf("\nYour Ci40 does not have a Device Server certificate. Please follow the workshop instructions on docs.creatordev.io.\n\n");
        exit(-1);
    }
}

int main(void)
{
    /* Check for Device Server certificate */
    certcheck();

    /* Set signal handler to exit program when Ctrl+c is pressed */
    struct sigaction action = {
        .sa_handler = exit_program,
        .sa_flags = 0
    };
    sigemptyset(&action.sa_mask);
    sigaction (SIGINT, &action, NULL);

    /* Create and initialise client session */
    session = AwaClientSession_New();

    /* Use default IPC configuration */
    AwaClientSession_Connect(session);

    /* Initialise LEDs for use in the callback */
    led_init();

    /* Set up LWM2M objects/instances/resources */
    DefineRelayObject();
    SetInitialValues();

    /* Subscribe to resource, and tie the subscription to the "changeCallback" function */
    AwaClientChangeSubscription * subscription = AwaClientChangeSubscription_New("/3201/0/5550", ChangeCallback, NULL);

    /* Start listening to notifications */
    AwaClientSubscribeOperation * subscribeOperation = AwaClientSubscribeOperation_New(session);
    AwaClientSubscribeOperation_AddChangeSubscription(subscribeOperation, subscription);
    AwaClientSubscribeOperation_Perform(subscribeOperation, OPERATION_PERFORM_TIMEOUT);
    AwaClientSubscribeOperation_Free(&subscribeOperation);

    while (running) {
        AwaClientSession_Process(session, OPERATION_PERFORM_TIMEOUT);
        AwaClientSession_DispatchCallbacks(session); // Trigger the callback if resource changes
    }

    /* Unsubscribe from resource */
    AwaClientSubscribeOperation * cancelSubscribeOperation = AwaClientSubscribeOperation_New(session);
    AwaClientSubscribeOperation_AddCancelChangeSubscription(cancelSubscribeOperation, subscription);
    AwaClientSubscribeOperation_Perform(cancelSubscribeOperation, OPERATION_PERFORM_TIMEOUT);
    AwaClientSubscribeOperation_Free(&cancelSubscribeOperation);

    /* Free the change subscription */
    AwaClientChangeSubscription_Free(&subscription);

    AwaClientSession_Disconnect(session);
    AwaClientSession_Free(&session);

    return 0;
}