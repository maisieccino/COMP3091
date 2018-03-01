#include "contiki.h"
#include "contiki-lib.h"
#include "contiki-net.h"

#include <sys/clock.h>
#include "letmecreate/core/network.h"
#include "letmecreate/core/common.h"
#include "letmecreate/click/motion.h"
//#include "letmecreate/core/debug.h"
#include <sys/etimer.h>
#include <leds.h>

#include <string.h>
#include <stdio.h>
#include <stdbool.h>

#define UDP_CONNECTION_ADDR "fe80:0:0:0:19:f5ff:fe89:1af0"
#define SERVER_PORT 9876
#define CLIENT_PORT 3001
#define BUFFER_SIZE 128
#define PROC_INTERVAL 20 * CLOCK_SECOND

#ifndef DEVICE_ID
#define DEVICE_ID -1
#endif

#ifndef PAIR_ID
#define PAIR_ID -1
#endif

static bool motion_detected;

void motion_callback(uint8_t event)
{
  motion_detected = true;
}

PROCESS(detect_main, "Main process for detector");
AUTOSTART_PROCESSES(&detect_main);
PROCESS_THREAD(detect_main, ev, data)
{
  PROCESS_BEGIN();
  {
    static struct etimer et;
    static struct uip_conn *connection;
    static char buf[BUFFER_SIZE];
    static int res = 0;

    etimer_set(&et, CLOCK_SECOND * 2);
    PROCESS_WAIT_EVENT_UNTIL(etimer_expired(&et));

    leds_off(LED1);
    leds_on(LED2);

    connection = tcp_new_connection(SERVER_PORT, UDP_CONNECTION_ADDR);
    PROCESS_WAIT_TCP_CONNECTED();
    leds_on(LED1);
    leds_off(LED2);
    // motion_detected = false;

    // // wait a bit to try to give the UDP connection a chance... might work?
    // etimer_set(&et, CLOCK_SECOND * 20);
    // while (true) {
    //   PROCESS_YIELD();
    //   if (etimer_expired(&et)) {
    //     // say hi!
    //     sprintf(buf, "{\"pair_id\":%d,\"type\":\"detector\",\"device_id\":%d,\"command\":\"id\"}", PAIR_ID, DEVICE_ID);
    //     udp_packet_send(connection, buf, strlen(buf));
    //     PROCESS_WAIT_UDP_SENT();
    //     break;
    //   }
    // }

    // motion_click_enable(MIKROBUS_1);
    // motion_click_attach_callback(MIKROBUS_1, motion_callback);

    etimer_set(&et, PROC_INTERVAL);
    while (true) {
      res = 0;
      PROCESS_YIELD();
      if (motion_detected) {
        // sprintf(buf, "{\"device_id\":%d,\"command\":\"motion\"}", DEVICE_ID);
        // udp_packet_send(connection, buf, strlen(buf));
        // PROCESS_WAIT_UDP_SENT();
        motion_detected = false;
        continue;
      }

      if (etimer_expired(&et)) {
        leds_off(LED1);
        leds_off(LED2);
        sprintf(buf, "{\"device_id\":%d,\"command\":\"heartbeat\"}", DEVICE_ID);
        res = tcp_packet_send(connection, buf, strlen(buf));
        PROCESS_WAIT_TCP_SENT();
        if (res == -1) {
          leds_on(LED2);
        }
        leds_on(LED1);
        etimer_restart(&et);
      }
    }

    // motion_click_disable(MIKROBUS_1);
  }
  PROCESS_END();
}
